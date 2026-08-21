import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const QUEUE_KEY = "queue:emails";

app.post("/emails", async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject,
    body: req.body.body,
    createdAt: new Date().toISOString(),
  };
  await redis.lpush(QUEUE_KEY, JSON.stringify(job));
  res.status(201).json({ queued: true, job });
});

app.get("/emails/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY);
  if (!rawJob) {
    return res.status(404).json({ message: "No jobs in the queue" });
  }
  const job = JSON.parse(rawJob); // Simulate processing the job
  res.json({ message: "Email Sent", job });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
