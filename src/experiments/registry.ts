export const experiments = {
  ranking: {
    id: "ranking",
    name: "Ranking",
    path: "/",
  },
} as const;

export type ExperimentId = keyof typeof experiments;
