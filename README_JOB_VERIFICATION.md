# Job Verification Cron API

This document describes the new cron job API that verifies and republishes missing jobs for files with Processing and Queued status.

## Overview

The job verification cron API is designed to:
1. Query all files with Processing and Queued status
2. Verify each job ID by checking if it exists in BullMQ
3. Republish jobs that are not found in BullMQ

This ensures that no jobs get lost or stuck in the system, improving the reliability of the video processing pipeline.

## Implementation Details

### New Files

- `/server/api/src/api/assets/services/job-verification.service.ts`: Service that handles job verification and republishing

### Modified Files

- `/server/api/src/api/assets/controllers/cronjob.controller.ts`: Added a new endpoint for job verification
- `/server/api/src/api/assets/assets.module.ts`: Added JobVerificationService to the providers array

## API Endpoint

```
POST /api/v1/cron-jobs/verify-jobs
```

### Response

```json
{
  "message": "Job verification completed successfully",
  "verified": 10,
  "republished": 2
}
```

- `verified`: Number of jobs that were verified
- `republished`: Number of jobs that were republished because they were not found in BullMQ

## Testing

### Manual Testing

1. Start the API server
2. Make a POST request to the endpoint:

```bash
curl -X POST http://localhost:3000/api/v1/cron-jobs/verify-jobs
```

3. Check the response to see how many jobs were verified and republished
4. Check the server logs for detailed information about which jobs were republished

### Verification

To verify that the job verification is working correctly:

1. Find a file with Processing or Queued status in the database
2. Manually delete the corresponding job from BullMQ (using the Bull Dashboard or Redis CLI)
3. Call the job verification endpoint
4. Verify that the job was republished by checking:
   - The response shows a non-zero `republished` count
   - The server logs show the specific file ID that was republished
   - The job appears in BullMQ again (using the Bull Dashboard)

## Scheduling

This endpoint is designed to be called by a cron job scheduler. It's recommended to schedule it to run every few minutes to ensure that no jobs get stuck in the system.

Example cron schedule (every 5 minutes):

```
*/5 * * * * curl -X POST http://localhost:3000/api/v1/cron-jobs/verify-jobs
```

## Troubleshooting

If jobs are not being republished as expected:

1. Check the server logs for any errors
2. Verify that the file status is correctly set to Processing or Queued
3. Ensure that BullMQ is properly configured and running
4. Check that the Redis connection is working correctly