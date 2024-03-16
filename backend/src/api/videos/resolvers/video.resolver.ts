import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateVideoResponse, PaginatedVideoResponse, Video, VideoStatus } from '../models/videos.model';
import { CreateVideoInputDto } from '../dtos/create-video-input.dto';
import { VideoService } from '../services/video.service';
import { VideoMapper } from '@/src/api/videos/mapper/video.mapper';
import { ListVideoInputDto } from '@/src/api/videos/dtos/list-video-input.dto';
import { GetVideoInputDto } from '@/src/api/videos/dtos/get-video-input.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateVideoInputDto } from '@/src/api/videos/dtos/update-video-input.dto';

@Resolver(() => Video)
export class VideoResolver {
  constructor(private videoService: VideoService, private videoMapper: VideoMapper) {
  }

  @Mutation(() => CreateVideoResponse, { name: 'CreateVideo' })
  async createVideo(
    @Args('createVideoInput') createVideoInput: CreateVideoInputDto
  ): Promise<CreateVideoResponse> {
    let createdVideo = await this.videoService.create(createVideoInput);
    return this.videoMapper.toCreateVideoResponse(createdVideo);

  }

  @Mutation(() => Video, { name: 'UpdateVideo' })
  async updateVideo(@Args('_id') id: string, @Args('updateVideoInput') updateVideoInput: UpdateVideoInputDto): Promise<Video> {
    let currentVideo = await this.videoService.getVideo({ _id: id });
    if (!currentVideo) {
      throw new NotFoundException('Video not found');
    }

    let updatedVideo = await this.videoService.update(currentVideo, updateVideoInput);
    let videoStatusDetails = await this.videoService.getVideoStatus(updatedVideo);
    let videoStatuses: VideoStatus[] = this.videoMapper.toVideoStatuses(videoStatusDetails);

    return this.videoMapper.toGetVideoResponse(updatedVideo, videoStatuses);
  }

  @Mutation(() => String, { name: 'DeleteVideo' })
  async deleteVideo(@Args('_id') id: string): Promise<string> {
    let currentVideo = await this.videoService.getVideo({ _id: id });
    if (!currentVideo) {
      throw new NotFoundException('Video not found');
    }

    await this.videoService.softDeleteVideo(currentVideo);
    return 'Video deleted successfully';
  }

  @Query(() => PaginatedVideoResponse, { name: 'ListVideo' })
  async listVideos(@Args('listVideoInput') listVideoInput: ListVideoInputDto): Promise<PaginatedVideoResponse> {
    console.log('listVideos ', listVideoInput);
    let paginatedResult = await this.videoService.listVideos(listVideoInput);
    return this.videoMapper.toPaginatedVideoResponse(paginatedResult);

  }

  @Query(() => Video, { name: 'GetVideo' })
  async getVideo(@Args('getVideoInput') getVideoInputDto: GetVideoInputDto): Promise<Video> {
    let video = await this.videoService.getVideo(getVideoInputDto);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    let videoStatusDetails = await this.videoService.getVideoStatus(video);
    let videoStatuses: VideoStatus[] = this.videoMapper.toVideoStatuses(videoStatusDetails);
    return this.videoMapper.toGetVideoResponse(video, videoStatuses);

  }
}