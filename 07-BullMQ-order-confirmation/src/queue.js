import { Queue } from "bullmq";

const connection = {
  host: "localhost",
  port: 6379,
};

///creation of queue
const emailQueue = new Queue("emails", { connection });

export {
  connection,
  emailQueue,
};
