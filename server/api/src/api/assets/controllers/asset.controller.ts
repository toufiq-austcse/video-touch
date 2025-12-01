import { Body, Controller, ForbiddenException, NotFoundException, Param, Post } from '@nestjs/common';
import { CreateAssetInputDto } from '@/src/api/assets/dtos/create-asset-input.dto';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';
import { UserService } from '@/src/api/auth/services/user.service';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';
import mongoose from 'mongoose';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { FILE_STATUS } from 'video-touch-common/dist/constants';
import { TranscriptService } from '@/src/api/assets/services/transcript.service';

@Controller({ version: '1', path: 'assets' })
export class AssetController {
  constructor(
    private assetService: AssetService,
    private userService: UserService,
    private assetRepo: AssetRepository,
    private fileRepo: FileRepository,
    private transcriptService: TranscriptService
  ) {}

  @Post()
  async createAsset(@Body() createAssetInputDto: CreateAssetInputDto) {
    let user = await this.userService.getUserEmail(createAssetInputDto.email);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    let createdAsset = await this.assetService.create(createAssetInputDto, user);
    let statusLogs = AssetMapper.toStatusLogsResponse(createdAsset.status_logs as [StatusDocument]);
    return AssetMapper.toAssetResponse(createdAsset, statusLogs);
  }

  @Post('/:assetId/generate-transcript')
  async generateTranscript(@Param('assetId') assetId: string) {
    let asset = await this.assetRepo.findOne({
      _id: mongoose.Types.ObjectId(assetId),
    });
    if (!asset) {
      throw new NotFoundException('Asset does not exist');
    }

    let transcriptFile = await this.fileRepo.findOne({
      asset_id: mongoose.Types.ObjectId(assetId),
    });
    if (!transcriptFile) {
      throw new NotFoundException('Transcript file does not exist for this asset');
    }
    if (transcriptFile.latest_status === FILE_STATUS.READY) {
      throw new ForbiddenException('Transcript already generated for this asset');
    }
    await this.transcriptService.generateTranscript(assetId, transcriptFile);
    return { message: 'Transcript generation initiated' };
  }
}
