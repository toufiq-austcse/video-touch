import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { Utils } from 'video-touch-common';
import { FILE_TYPE } from 'video-touch-common/dist/constants';
import { File } from '../models/file.model';
import { FileRepository } from '../repositories/file.repository';

@Resolver(() => File)
export class FileResolver {
  constructor(private s3ClientService: S3ClientService, private fileRepository: FileRepository) {}

  @Query(() => String, { name: 'GetFileUrl' })
  async getFileUrl(@Args('id') fileId: string) {
    let file = await this.fileRepository.findOne({ _id: Types.ObjectId(fileId) });
    if (!file) {
      throw new NotFoundException('file not found');
    }

    let s3Key = null;
    if (file.type === FILE_TYPE.THUMBNAIL) {
      s3Key = Utils.getS3ThumbnailPath(file.asset_id.toString());
    }
    if (file.type === FILE_TYPE.SOURCE) {
      s3Key = Utils.getS3SourceFileVideoPath(file.asset_id.toString(), file.name);
    }
    if (file.type === FILE_TYPE.DOWNLOAD) {
      s3Key = Utils.getS3DownloadFilePath(file.asset_id.toString(), file.name);
    }
    if (file.type === FILE_TYPE.AUDIO) {
      s3Key = Utils.getS3AudioFilePath(file.asset_id.toString(), file.name);
    }

    if (!s3Key) {
      throw new BadRequestException(
        `Unsupported file type for URL generation: ${file.type}. Only thumbnail, source, audio, and download types are supported.`
      );
    }

    let signedUrl = await this.s3ClientService.generateSignedUrlToGetObject(
      AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
      s3Key,
      3600
    );
    return signedUrl;
  }
}
