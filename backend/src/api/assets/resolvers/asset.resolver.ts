import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Asset, CreateAssetResponse, PaginatedAssetResponse } from '../models/asset.model';
import { CreateAssetInputDto } from '../dtos/create-asset-input.dto';
import { AssetService } from '../services/asset.service';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { ListAssetInputDto } from '@/src/api/assets/dtos/list-asset-input.dto';
import { GetAssetInputDto } from '@/src/api/assets/dtos/get-asset-input.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateAssetInputDto } from '@/src/api/assets/dtos/update-asset-input.dto';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';

@Resolver(() => Asset)
export class AssetResolver {
  constructor(private assetService: AssetService, private assetMapper: AssetMapper) {
  }

  @Mutation(() => CreateAssetResponse, { name: 'CreateAsset' })
  async createVideo(@Args('createAssetInput') createAssetInputDto: CreateAssetInputDto): Promise<CreateAssetResponse> {
    let createdVideo = await this.assetService.create(createAssetInputDto);
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
  async listVideos(@Args('listAssetInputDto') listAssetInputDto: ListAssetInputDto): Promise<PaginatedAssetResponse> {
    console.log('list assets ', listAssetInputDto);
    let paginatedResult = await this.assetService.listVideos(listAssetInputDto);
    return this.assetMapper.toPaginatedAssetResponse(paginatedResult);
  }

  @Query(() => Asset, { name: 'GetAsset' })
  async getVideo(@Args('getAssetInputDto') getAssetInputDto: GetAssetInputDto): Promise<Asset> {
    let asset = await this.assetService.getAsset(getAssetInputDto);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    console.log('asset', asset);
    let statusLogs = this.assetMapper.toStatusLogsResponse(asset.status_logs as [StatusDocument]);

    return this.assetMapper.toGetAssetResponse(asset, statusLogs);
  }
}
