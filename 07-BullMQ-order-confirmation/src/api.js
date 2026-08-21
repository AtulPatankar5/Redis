import express from "express";
import {emailQueue} from "./queue.js";

const app = express();
app.use(express.json());

app.post("/welcome-email", async (req, res) => {
  const job = await emailQueue.add(
    "send-welcome-email",
    {
      to: req.body.to,
      subject: req.body.subject,
      body: req.body.body,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  );

  res
    .status(200)
    .json({ message: "Welcome email job added to the queue", jobId: job.id });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
