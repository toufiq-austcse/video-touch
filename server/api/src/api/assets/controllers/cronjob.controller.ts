import { Controller, Post } from '@nestjs/common';
import { CleanupService } from '../services/cleanup.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobVerificationService } from '@/src/api/assets/services/job-verification.service';

@ApiTags('cronjob')
@Controller({ version: '1', path: 'cron-jobs' })
export class CronjobController {
  constructor(
    private readonly cleanupService: CleanupService,
    private jobVerificationService: JobVerificationService
  ) {}

  @Post('cleanup-device')
  @ApiOperation({ summary: 'Cleanup temporary video files' })
  @ApiResponse({
    status: 200,
    description: 'Successfully cleaned up temporary files',
  })
  async cleanup() {
    await this.cleanupService.cleanupDevice();
    return { message: 'Cleanup completed successfully' };
  }

  @Post('verify-bullmq-jobs')
  @ApiOperation({ summary: 'Verify and republish jobs for files with Processing or Queued status' })
  @ApiResponse({
    status: 200,
    description: 'Successfully verified and republished jobs',
  })
  async verifyAndRepublishJobs() {
    const result = await this.jobVerificationService.verifyAndRepublishJobs();
    return { message: 'Job verification and republishing completed', data: result };
  }
}
