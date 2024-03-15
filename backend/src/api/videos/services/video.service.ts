import { Injectable } from '@nestjs/common';
import { CreateVideoInputDto } from '../dtos/create-video-input.dto';
import { VideoDocument } from '../schemas/videos.schema';
import { terminal } from '@/src/common/utils/terminal';
import { VIDEO_STATUS } from '@/src/common/constants';
import { VideoRepository } from '@/src/api/videos/repositories/video.repository';
import { ListVideoInputDto } from '@/src/api/videos/dtos/list-video-input.dto';
import { GetVideoInputDto } from '@/src/api/videos/dtos/get-video-input.dto';
import { UpdateVideoInputDto } from '@/src/api/videos/dtos/update-video-input.dto';


@Injectable()
export class VideoService {
  constructor(private repository: VideoRepository) {

  }

  async create(createVideoInput: CreateVideoInputDto) {
    let videoDocument = this.buildVideoDocument(createVideoInput);
    return this.repository.create(videoDocument);

  }

  buildVideoDocument(createVideoInput: CreateVideoInputDto): Omit<VideoDocument, '_id'> {
    let title = createVideoInput.title;
    if (!title) {
      title = this.parsedTitle(createVideoInput.source_url);
    }
    return {
      title: title,
      description: createVideoInput.description,
      source_url: createVideoInput.source_url,
      status: VIDEO_STATUS.QUEUED,
      tags: createVideoInput.tags
    };
  }

  async getMetadata(url: string): Promise<{
    file_name: string,
    size: number,
    height: number,
    width: number,
    duration: number,
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
    return this.repository.getPaginatedVideos(listVideoInputDto.first, listVideoInputDto.after);
  }

  async getVideo(getVideoInputDto: GetVideoInputDto) {
    return this.repository.findOne({
      _id: getVideoInputDto._id
    });

  }

  async update(oldVideo: VideoDocument, updateVideoInput: UpdateVideoInputDto) {
    await this.repository.findOneAndUpdate({ _id: oldVideo._id }, {
      title: updateVideoInput.title ? updateVideoInput.title : oldVideo.title,
      description: updateVideoInput.description ? updateVideoInput.description : updateVideoInput.description,
      tags: updateVideoInput.tags ? updateVideoInput.tags : oldVideo.tags
    });
    return this.repository.findOne({ _id: oldVideo._id });

  }
}