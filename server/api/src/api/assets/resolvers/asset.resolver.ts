import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Asset, CreateAssetResponse, PaginatedAssetResponse } from '../models/asset.model';
import { CreateAssetFromUploadInputDto, CreateAssetInputDto } from '../dtos/create-asset-input.dto';
import { AssetService } from '../services/asset.service';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { ListAssetInputDto } from '@/src/api/assets/dtos/list-asset-input.dto';
import { GetAssetInputDto } from '@/src/api/assets/dtos/get-asset-input.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateAssetInputDto } from '@/src/api/assets/dtos/update-asset-input.dto';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';
import { FileService } from '@/src/api/assets/services/file.service';

@Resolver(() => Asset)
export class AssetResolver {
  constructor(private assetService: AssetService, private fileService: FileService, private assetMapper: AssetMapper) {
  }

  @Mutation(() => CreateAssetResponse, { name: 'CreateAsset' })
  async createVideo(@Args('createAssetInput') createAssetInputDto: CreateAssetInputDto): Promise<CreateAssetResponse> {
    let createdVideo = await this.assetService.create(createAssetInputDto);
    return this.assetMapper.toCreateAssetResponse(createdVideo);
  }

  @Mutation(() => CreateAssetResponse, { name: 'CreateAssetFromUpload' })
  async createAssetFromUpload(
    @Args('createAssetFromUploadInput') createAssetInputDto: CreateAssetFromUploadInputDto
  ): Promise<CreateAssetResponse> {
    let createdVideo = await this.assetService.createAssetFromUploadReq(createAssetInputDto);
    return this.assetMapper.toCreateAssetResponse(createdVideo);
  }

  @Mutation(() => Asset, { name: 'UpdateAsset' })
  async updateVideo(
    @Args('_id') id: string,
    @Args('updateAssetInputDto') updateAssetInputDto: UpdateAssetInputDto
  ): Promise<Asset> {
    let currentVideo = await this.assetService.getAsset({ _id: id });
    if (!currentVideo) {
      throw new NotFoundException('Asset not found');
    }

    let updatedAsset = await this.assetService.update(currentVideo, updateAssetInputDto);
    let statusLogs = this.assetMapper.toStatusLogsResponse(updatedAsset.status_logs as [StatusDocument]);

    return this.assetMapper.toGetAssetResponse(updatedAsset, statusLogs);
  }

  @Mutation(() => String, { name: 'DeleteAsset' })
  async deleteVideo(@Args('_id') id: string): Promise<string> {
    let currentVideo = await this.assetService.getAsset({ _id: id });
    if (!currentVideo) {
      throw new NotFoundException('Asset not found');
    }

    await this.assetService.softDeleteVideo(currentVideo);
    return 'Video deleted successfully';
  }

  @Query(() => PaginatedAssetResponse, { name: 'ListAsset' })
  async listAssets(@Args('listAssetInputDto') listAssetInputDto: ListAssetInputDto): Promise<PaginatedAssetResponse> {
    console.log('list assets ', listAssetInputDto);
    let paginatedResult = await this.assetService.listVideos(listAssetInputDto);
    let thumbnails = await this.fileService.listThumbnailFiles(paginatedResult.items);
    return this.assetMapper.toPaginatedAssetResponse(paginatedResult, thumbnails);
  }

  @Query(() => Asset, { name: 'GetAsset' })
  async getAsset(@Args('getAssetInputDto') getAssetInputDto: GetAssetInputDto): Promise<Asset> {
    let asset = await this.assetService.getAsset(getAssetInputDto);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    let statusLogs = this.assetMapper.toStatusLogsResponse(asset.status_logs as [StatusDocument]);

    return this.assetMapper.toGetAssetResponse(asset, statusLogs);
  }
}
