import express, { Request, Response } from "express";
import crypto from "crypto";
import { runDexterCLI } from "./dexterRunner";
import { createJob, appendOutput, finishJob, getJob } from "./jobs";

const app = express();
app.use(express.json());

app.post("/api/dexter/run", (req: Request, res: Response) => {
  const query = req.body?.query;

  // 入力検証
  if (typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "invalid query" });
  }

  const id = crypto.randomUUID();
  createJob(id);

  try {
    runDexterCLI(
      query,
      (o: string) => appendOutput(id, o),
      (ok: boolean) => finishJob(id, ok)
    );
  } catch (e: any) {
    finishJob(id, false);
    return res.status(500).json({ error: "failed to start process" });
  }

  return res.json({ jobId: id });
});

app.get("/api/dexter/status", (req: Request, res: Response) => {
  const id = req.query.jobId;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "invalid jobId" });
  }

  const job = getJob(id);
  if (!job) {
    return res.status(404).json({ status: "not_found" });
  }

  return res.json({ status: job.status });
});

app.get("/api/dexter/result", (req: Request, res: Response) => {
  const id = req.query.jobId;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "invalid jobId" });
  }

  const job = getJob(id);
  if (!job) {
    return res.status(404).json({});
  }

  return res.json(job);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server started`);
});