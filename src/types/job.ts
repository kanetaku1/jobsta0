export type Job = {
  id: number;
  createdAt: Date;
  title: string;
  description: string | null;
  wage: number;
  jobDate: Date;
  maxMembers: number;
};
