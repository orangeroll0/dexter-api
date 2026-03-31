type JobStatus = "running" | "done" | "error";

type Job = {
  status: JobStatus;
  output: string[];
};

const jobs = new Map<string, Job>();

export function createJob(id: string): void {
  jobs.set(id, { status: "running", output: [] });
}

export function appendOutput(id: string, t: string): void {
  const job = jobs.get(id);
  if (!job) return;

  // 終了後の書き込み防止（状態整合性）
  if (job.status !== "running") return;

  job.output.push(t);
}

export function finishJob(id: string, ok: boolean): void {
  const job = jobs.get(id);
  if (!job) return;

  // 二重終了防止
  if (job.status !== "running") return;

  job.status = ok ? "done" : "error";
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}