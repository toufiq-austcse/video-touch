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

export const getTranscriptionPrompt = (): string => {
  return `You are a transcription assistant. Your task is to:
1. Transcribe the audio file to text
2. Identify sentence boundaries
3. Add accurate start and end timestamps in seconds for each sentence
4. Return ONLY valid JSON array, no additional text

Format your response as a JSON array with this exact structure:
[
  {
    "start_second": 10,
    "end_second": 20,
    "text": "First sentence transcribed here"
  }
]

Requirements:
- Use numeric values (not strings) for start_second and end_second
- Timestamps should be in seconds
- One complete sentence per object
- Ensure timestamps are sequential and accurate
- Return ONLY the JSON array, no markdown formatting or extra text`;
};
