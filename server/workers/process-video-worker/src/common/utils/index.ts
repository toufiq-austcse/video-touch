import { Job } from 'bullmq';

export const checkIsLastAttempt = (job: Job): boolean => {
  console.log(`Job ${job.id} attempts made: ${job.attemptsMade}, max attempts: ${job.opts.attempts}`);

  // Check if the job has been retried more than the maximum allowed attempts
  if (job.attemptsMade + 1 >= job.opts.attempts) {
    console.log(`Job ${job.id} has reached the maximum retry limit.`);
    return true; // This is the last attempt
  }
  return false; // There are more attempts left
};
