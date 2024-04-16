import { Injectable } from '@nestjs/common';
import { CreateVideoInputDto } from '../dtos/create-video-input.dto';
import { AssetDocument } from '../schemas/assets.schema';
import { terminal } from '@/src/common/utils/terminal';
import { AssetRepository } from '@/src/api/videos/repositories/asset.repository';
import { ListVideoInputDto } from '@/src/api/videos/dtos/list-video-input.dto';
import { GetVideoInputDto } from '@/src/api/videos/dtos/get-video-input.dto';
import { UpdateVideoInputDto } from '@/src/api/videos/dtos/update-video-input.dto';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { VideoDownloadJobModel } from '@/src/api/videos/models/job.model';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import mongoose from 'mongoose';

@Injectable()
export class AssetService {

  constructor(private repository: AssetRepository,
              private rabbitMqService: RabbitMqService) {
  }

  async create(createVideoInput: CreateVideoInputDto) {
    let videoDocument = this.buildAssetDocument(createVideoInput);
    return this.repository.create(videoDocument);
  }

  buildAssetDocument(createVideoInput: CreateVideoInputDto): Omit<AssetDocument, '_id'> {
    let title = createVideoInput.title;
    if (!title) {
      title = this.parsedTitle(createVideoInput.source_url);
    }
    return {
      title: title,
      description: createVideoInput.description,
      source_url: createVideoInput.source_url,
      tags: createVideoInput.tags
    };
  }

  async getMetadata(url: string): Promise<{
    file_name: string;
    size: number;
    height: number;
    width: number;
    duration: number;
  }> {
    let extractMetaCommand = `ffprobe -v quiet -show_streams -show_format -print_format json ${url}`;
    let showStreamCommandRes = await terminal(extractMetaCommand);
    let parsedData = JSON.parse(showStreamCommandRes);
    let videoInfo = parsedData.streams[0];
    let format = parsedData.format;

    return {
      file_name: format.filename,
      size: +format.size,
      height: videoInfo.height,
      width: videoInfo.width,
      duration: +videoInfo.duration
    };
  }

  private parsedTitle(source_url: string) {
    return source_url.split('/').pop().split('.').shift();
  }

  async listVideos(listVideoInputDto: ListVideoInputDto) {
    return this.repository.getPaginatedVideos(
      listVideoInputDto.first,
      listVideoInputDto.after,
      listVideoInputDto.before
    );
  }

  async getVideo(getVideoInputDto: GetVideoInputDto) {
    return this.repository.findOne({
      _id: getVideoInputDto._id
    });
  }

  async update(oldVideo: AssetDocument, updateVideoInput: UpdateVideoInputDto) {
    await this.repository.findOneAndUpdate(
      { _id: oldVideo._id },
      {
        title: updateVideoInput.title ? updateVideoInput.title : oldVideo.title,
        description: updateVideoInput.description ? updateVideoInput.description : updateVideoInput.description,
        tags: updateVideoInput.tags ? updateVideoInput.tags : oldVideo.tags
      }
    );
    return this.repository.findOne({ _id: oldVideo._id });
  }

  async softDeleteVideo(currentVideo: AssetDocument) {
    await this.repository.findOneAndUpdate(
      { _id: currentVideo._id },
      {
        is_deleted: true
      }
    );
    return this.repository.findOne({ _id: currentVideo._id });
  }

  // async insertVideoStatus(videoId: string, status: string, details: string) {
  //   let videoStatusDocument = this.buildStatusDocument(videoId, status, details);
  //   return this.videoStatusRepository.create(videoStatusDocument);
  // }

  async updateVideoStatus(videoId: string, status: string, details: string) {
    return this.repository.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(videoId)
    }, {
      latest_status: status,
      $push: {
        status_logs: {
          status: status,
          details: details
        }
      }
    });
  }

  // private buildStatusDocument(videoId: string, status: string, details: string): Omit<StatusDocument, '_id'> {
  //   return {
  //     status: status,
  //     details: details
  //   };
  // }

  async getVideoStatus(video: AssetDocument) {
    return [];
    // return this.videoStatusRepository.find({ video_id: video._id }, [
    //   'status',
    //   '_id',
    //   'video_id',
    //   'details',
    //   'createdAt',
    //   'updatedAt'
    // ]);
  }

  async pushDownloadVideoJob(videoDocument: AssetDocument) {
    let downloadVideoJob = this.buildDownloadVideoJob(videoDocument);
    return this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, AppConfigService.appConfig.RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY, downloadVideoJob);
  }

  private buildDownloadVideoJob(videoDocument: AssetDocument): VideoDownloadJobModel {
    return {
      _id: videoDocument._id.toString(),
      source_url: videoDocument.source_url
    };

  }

}
