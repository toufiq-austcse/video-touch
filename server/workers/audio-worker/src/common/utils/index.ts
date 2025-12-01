import { Job } from 'bullmq';
import console from 'node:console';

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
4. Add precise start and end timestamps in HH:MM:SS format for each segment
5. Return ONLY a valid JSON array - no other text or formatting

MANDATORY JSON Structure (use these EXACT field names):
[
  {
    "start": "00:00:10",
    "end": "00:00:20",
    "text": "Transcribed text in original language"
  }
]

CRITICAL: Timestamp Format
- Use field names "start" and "end"
- Timestamps MUST be in HH:MM:SS format (hours:minutes:seconds)
- Always use 2 digits for each component: HH:MM:SS
- For times under 1 hour: 00:MM:SS (e.g., "00:01:30" for 1 minute 30 seconds)
- For times over 1 hour: HH:MM:SS (e.g., "01:25:45" for 1 hour 25 minutes 45 seconds)
- Timestamps are strings, not numbers

Examples of CORRECT timestamps:
- "00:00:00" to "00:00:05" (0 to 5 seconds) ✓
- "00:00:55" to "00:01:05" (55 seconds to 1 minute 5 seconds) ✓
- "00:01:05" to "00:01:15" (1 min 5 sec to 1 min 15 sec) ✓
- "00:02:00" to "00:02:15" (2 minutes to 2 min 15 sec) ✓
- "01:00:00" to "01:00:15" (1 hour mark to 1 hour 15 sec) ✓
- "01:30:45" to "01:31:00" (1.5 hour mark) ✓

Examples of INCORRECT timestamps (DO NOT USE):
- "0:0:5" or "0:5" (missing leading zeros) ✗
- "65" or "125" (seconds only, no format) ✗
- 60.5 or 125 (numbers instead of strings) ✗
- "1:00" (missing hours component) ✗

Language Requirements:
- Transcribe in the ORIGINAL language spoken (Arabic→Arabic, Bengali→বাংলা, English→English, etc.)
- NEVER translate to another language
- Text should be trimmed with no leading/trailing spaces

Format Requirements:
- Return ONLY valid JSON array starting with [ and ending with ]
- Use string values in HH:MM:SS format for start and end
- Use EXACT field names: "start", "end", "text"
- Each object should contain one complete sentence or natural phrase
- Timestamps must be sequential and non-overlapping

FORBIDDEN - DO NOT use these:
- NO WebVTT format
- NO SRT format
- NO markdown code blocks (\`\`\`json)
- NO JSONL format (one object per line)
- NO explanatory text before or after JSON
- NO HTML or XML tags
- NO alternative field names like "text_content", "content", "transcript", "start_seconds", "end_seconds"

Example output for 2-minute audio file:
[{"start":"00:00:00","end":"00:00:05","text":"First sentence"},{"start":"00:00:05","end":"00:00:58","text":"Second sentence"},{"start":"00:00:58","end":"00:01:05","text":"Third sentence"},{"start":"00:01:05","end":"00:01:15","text":"Fourth sentence continuing past one minute"},{"start":"00:01:15","end":"00:02:00","text":"Fifth sentence at the two minute mark"}]`;
  return customPrompt;
};

export const GEN_AI_PLATFORM = {
  GOOGLE_GENAI: 'google_genai',
  OPENAI: 'openai',
};

export function checkLastAttempt(job: Job): boolean {
  console.log(`Job ${job.id} attempts made: ${job.attemptsMade}, max attempts: ${job.opts.attempts}`);

  // Check if the job has been retried more than the maximum allowed attempts
  if (job.attemptsMade + 1 >= job.opts.attempts) {
    console.log(`Job ${job.id} has reached the maximum retry limit.`);
    return true; // This is the last attempt
  }
  return false; // There are more attempts left
}
