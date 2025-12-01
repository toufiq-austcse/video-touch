import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import mongoose from 'mongoose';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { Constants } from 'video-touch-common';

@Injectable()
export class TranscriptService {
  constructor(private fileRepository: FileRepository, private jobManagerService: JobManagerService) {}

  async generateTranscript(assetId: string, transcriptFile: FileDocument) {
    let partialTranscriptFiles = await this.fileRepository.find({
      asset_id: mongoose.Types.ObjectId(assetId),
      type: Constants.FILE_TYPE.PARTIAL_TRANSCRIPT,
    });
    if (partialTranscriptFiles.length === 0) {
      throw new Error('No partial transcript files found for this asset');
    }
    console.log('partialTranscriptFiles ', partialTranscriptFiles.length);
    if (!this.checkAllPartialTranscriptsReady(partialTranscriptFiles)) {
      throw new Error('Not all partial transcript files are ready');
    }

    // Sort files by name to ensure correct order (e.g., transcript_0.json, transcript_1.json, etc.)
    partialTranscriptFiles.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

    let jobData = await this.jobManagerService.publishTranscriptMergingJob(
      assetId,
      transcriptFile,
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
  }

  private checkAllPartialTranscriptsReady(partialTranscriptFiles: FileDocument[]): boolean {
    return partialTranscriptFiles.every((file) => file.latest_status === Constants.FILE_STATUS.READY);
  }

  async generateTranscriptByPartialTranscriptFile(partialTranscriptFile: FileDocument) {
    let transcriptFile = await this.fileRepository.findOne({
      asset_id: partialTranscriptFile.asset_id,
      type: Constants.FILE_TYPE.TRANSCRIPT,
    });
    if (!transcriptFile) {
      throw new Error('Transcript file does not exist for this asset');
    }
    return this.generateTranscript(transcriptFile.asset_id.toString(), transcriptFile);
  }
}
