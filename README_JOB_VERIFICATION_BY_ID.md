# Job Verification by ID

This document describes the new functionality added to verify and republish jobs by job_id.

## Overview

The job verification by ID feature allows you to:
1. Query a file by its job_id
2. Verify if the job exists in BullMQ
3. Republish the job if it's not found in BullMQ

This is useful for troubleshooting specific jobs that might be stuck or lost in the system.

## Implementation Details

### Modified Files

- `/server/api/src/api/assets/services/job-verification.service.ts`: Added a new method `verifyAndRepublishJobById` to verify jobs by job_id
- `/server/api/src/api/assets/controllers/cronjob.controller.ts`: Added a new endpoint for verifying jobs by job_id

## API Endpoint

```
POST /api/v1/cron-jobs/verify-job/:jobId
```

Where `:jobId` is the ID of the job to verify.

### Response

```json
{
  "message": "Job for file 60f1e5b3e6b3f32a8c9b4567 republished successfully",
  "verified": true,
  "republished": true,
  "fileId": "60f1e5b3e6b3f32a8c9b4567"
}
```

- `message`: A descriptive message about the result
- `verified`: Boolean indicating if the file was found and verification was attempted
- `republished`: Boolean indicating if the job was republished
- `fileId`: The ID of the file associated with the job (if found)

## Testing

### Manual Testing

1. Start the API server
2. Find a job_id from the files collection in the database
3. Make a POST request to the endpoint:

```bash
curl -X POST http://localhost:3000/api/v1/cron-jobs/verify-job/your-job-id-here
```

4. Check the response to see if the job was verified and republished if needed
5. Check the server logs for detailed information about the verification process

### Verification

To verify that the job verification is working correctly:

1. Find a file with a job_id in the database
2. Manually delete the corresponding job from BullMQ (using the Bull Dashboard or Redis CLI)
3. Call the job verification endpoint with the job_id
4. Verify that the job was republished by checking:
   - The response shows `"republished": true`
   - The server logs show that the job was republished
   - The job appears in BullMQ again (using the Bull Dashboard)

## Troubleshooting

If job verification is not working as expected:

1. Check the server logs for any errors
2. Verify that the job_id exists in the files collection
3. Ensure that BullMQ is properly configured and running
4. Check that the Redis connection is working correctly

## How It Works

1. The endpoint receives a job_id parameter
2. The service queries the files collection to find a file with the specified job_id
3. If a file is found, it checks if the job exists in the appropriate BullMQ queue based on the file's height
4. If the job doesn't exist, it republishes the job using the JobManagerService
5. The result of the verification and republishing process is returned to the client

This approach ensures that specific jobs can be verified and republished if needed, improving the reliability of the video processing pipeline.