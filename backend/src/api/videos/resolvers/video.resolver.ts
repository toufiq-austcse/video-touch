import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateVideoResponse, PaginatedVideoResponse, Video } from '../models/videos.model';
import { CreateVideoInputDto } from '../dtos/create-video-input.dto';
import { VideoService } from '../services/video.service';
import { VideoMapper } from '@/src/api/videos/mapper/video.mapper';
import { ListVideoInputDto } from '@/src/api/videos/dtos/list-video-input.dto';
import { GetVideoInputDto } from '@/src/api/videos/dtos/get-video-input.dto';
import { NotFoundException } from '@nestjs/common';

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

  @Query(() => PaginatedVideoResponse, { name: 'ListVideo' })
  async listVideos(@Args('listVideoInput') listVideoInput: ListVideoInputDto): Promise<PaginatedVideoResponse> {
    console.log('listVideos ', listVideoInput);
    let paginatedResult = await this.videoService.listVideos(listVideoInput);
    return this.videoMapper.toPaginatedVideoResponse(paginatedResult);

  }

  @Query(() => Video, { name: 'GetVideo' })
  async getVideo(@Args('getVideoInput') getVideoInputDto: GetVideoInputDto): Promise<Video> {
    let video = await this.videoService.getVideo(getVideoInputDto);
    console.log('video ', video);
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return this.videoMapper.toGetVideoResponse(video);

  }
}