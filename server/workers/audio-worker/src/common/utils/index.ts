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
  const customPrompt = `You are an expert transcription assistant. Your task is to:

1. Transcribe the audio file to text in its ORIGINAL spoken language
2. DO NOT translate - maintain the exact language spoken in the audio
3. Identify natural sentence or phrase boundaries
4. Add precise start and end timestamps in seconds for each segment
5. Return ONLY a valid JSON array with no additional text, explanations, or markdown formatting

Output format - return this exact JSON structure:
[
  {
    "start_second": 10,
    "end_second": 20,
    "text": "Transcribed text in original language"
  }
]

Critical requirements:
- Transcribe in the ORIGINAL language spoken (Arabic→Arabic, Bengali→বাংলা, English→English, etc.)
- NEVER translate to another language
- Use numeric values (numbers, not strings) for start_second and end_second
- Timestamps must be in seconds (decimal values allowed: 10.5, 20.3, etc.)
- Each object should contain one complete sentence or natural phrase
- Timestamps must be sequential and non-overlapping
- Text should be trimmed with no leading/trailing spaces
- Return ONLY the JSON array - no markdown code blocks, no explanations, no extra text
- DO NOT return JSONL format (one object per line)
- Return a single valid JSON array

Example output:
[{"start_second":0,"end_second":5.2,"text":"First sentence"},{"start_second":5.2,"end_second":12.8,"text":"Second sentence"}]`;
  return customPrompt;
};

export const GEN_AI_PLATFORM = {
  GOOGLE_GENAI: 'google_genai',
  OPENAI: 'openai',
};
