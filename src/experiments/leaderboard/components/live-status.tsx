export function LiveStatus({
  onlineCount,
  visitCount,
}: {
  onlineCount: number | null;
  visitCount: number | null;
}) {
  if (!onlineCount && !visitCount) return null;

  const parts: string[] = [];
  if (onlineCount) parts.push(`${onlineCount} online`);
  if (visitCount) {
    parts.push(
      `${visitCount.toLocaleString("es-PA")} visitas desde el lanzamiento`,
    );
  }

  return (
    <p className="flex items-center gap-2 text-sm">
      {onlineCount ? (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-online opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-online" />
        </span>
      ) : null}
      {parts.join(" · ")}
    </p>
  );
}
