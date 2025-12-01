import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import mongoose from 'mongoose';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { FileService } from '@/src/api/assets/services/file.service';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { FILE_STATUS } from 'video-touch-common/dist/constants';

@Injectable()
export class TranscriptService {
  constructor(
    private fileRepository: FileRepository,
    private fileService: FileService,
    private jobManagerService: JobManagerService
  ) {}

  async generateTranscript(assetId: string, transcriptFile: FileDocument) {
    let partialTranscriptFiles = await this.fileRepository.find({
      asset_id: mongoose.Types.ObjectId(assetId),
      type: 'partial_transcript',
    });
    if (partialTranscriptFiles.length === 0) {
      throw new Error('No partial transcript files found for this asset');
    }
    console.log('partialTranscriptFiles ', partialTranscriptFiles.length);

    // Sort files by name to ensure correct order (e.g., transcript_0.json, transcript_1.json, etc.)
    partialTranscriptFiles.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

    let jobData = await this.jobManagerService.publishTranscriptMergingJob(
      assetId,
      transcriptFile._id.toString(),
      partialTranscriptFiles
    );
    await this.fileRepository.findOneAndUpdate(
      {
        _id: transcriptFile._id,
      },
      {
        job_id: jobData.id,
      }
    );
    await this.fileService.updateFileStatus(
      transcriptFile._id.toString(),
      FILE_STATUS.PROCESSING,
      'Transcript merging job published',
      0
    );
  }
}
