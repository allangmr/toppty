import { eq } from "drizzle-orm";
import { adminLoginAttempts, getDb } from "@/core/db";
import { createId } from "@/lib/utils";

export const ADMIN_MAX_FAILED_ATTEMPTS = 3;
export const ADMIN_LOCKOUT_MS = 30 * 60 * 1000;

type AttemptState = {
  failedCount: number;
  lockedUntil: Date | null;
};

const memoryAttempts = new Map<string, AttemptState>();

function memoryGet(fingerprintHash: string): AttemptState {
  return (
    memoryAttempts.get(fingerprintHash) ?? {
      failedCount: 0,
      lockedUntil: null,
    }
  );
}

function isStillLocked(lockedUntil: Date | null) {
  return Boolean(lockedUntil && lockedUntil.getTime() > Date.now());
}

async function readAttempt(fingerprintHash: string): Promise<AttemptState> {
  if (!process.env.DATABASE_URL) {
    return memoryGet(fingerprintHash);
  }

  try {
    const db = getDb();
    const [row] = await db
      .select({
        failedCount: adminLoginAttempts.failedCount,
        lockedUntil: adminLoginAttempts.lockedUntil,
      })
      .from(adminLoginAttempts)
      .where(eq(adminLoginAttempts.fingerprintHash, fingerprintHash))
      .limit(1);

    if (!row) return { failedCount: 0, lockedUntil: null };
    return {
      failedCount: row.failedCount,
      lockedUntil: row.lockedUntil,
    };
  } catch {
    return memoryGet(fingerprintHash);
  }
}

async function writeAttempt(fingerprintHash: string, state: AttemptState) {
  memoryAttempts.set(fingerprintHash, state);

  if (!process.env.DATABASE_URL) return;

  try {
    const db = getDb();
    const [existing] = await db
      .select({ id: adminLoginAttempts.id })
      .from(adminLoginAttempts)
      .where(eq(adminLoginAttempts.fingerprintHash, fingerprintHash))
      .limit(1);

    if (existing) {
      await db
        .update(adminLoginAttempts)
        .set({
          failedCount: state.failedCount,
          lockedUntil: state.lockedUntil,
          updatedAt: new Date(),
        })
        .where(eq(adminLoginAttempts.id, existing.id));
      return;
    }

    await db.insert(adminLoginAttempts).values({
      id: createId("adm"),
      fingerprintHash,
      failedCount: state.failedCount,
      lockedUntil: state.lockedUntil,
    });
  } catch {
    // Memory map still holds the attempt for this instance.
  }
}

export async function getAdminLockStatus(fingerprintHash: string) {
  const state = await readAttempt(fingerprintHash);
  if (isStillLocked(state.lockedUntil)) {
    return {
      locked: true as const,
      failedCount: state.failedCount,
      lockedUntil: state.lockedUntil!,
    };
  }
  return {
    locked: false as const,
    failedCount: state.lockedUntil ? 0 : state.failedCount,
    lockedUntil: null,
  };
}

export async function registerAdminLoginFailure(fingerprintHash: string) {
  const current = await readAttempt(fingerprintHash);
  const baseCount = isStillLocked(current.lockedUntil)
    ? current.failedCount
    : current.lockedUntil
      ? 0
      : current.failedCount;
  const failedCount = baseCount + 1;
  const lockedUntil =
    failedCount >= ADMIN_MAX_FAILED_ATTEMPTS
      ? new Date(Date.now() + ADMIN_LOCKOUT_MS)
      : null;

  await writeAttempt(fingerprintHash, { failedCount, lockedUntil });
  return {
    locked: Boolean(lockedUntil),
    failedCount,
    lockedUntil,
    remaining: Math.max(0, ADMIN_MAX_FAILED_ATTEMPTS - failedCount),
  };
}

export async function clearAdminLoginFailures(fingerprintHash: string) {
  memoryAttempts.delete(fingerprintHash);

  if (!process.env.DATABASE_URL) return;

  try {
    const db = getDb();
    await db
      .delete(adminLoginAttempts)
      .where(eq(adminLoginAttempts.fingerprintHash, fingerprintHash));
  } catch {
    // Best-effort clear.
  }
}
