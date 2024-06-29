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
  constructor(private assetService: AssetService) {}

  @Mutation(() => CreateAssetResponse, { name: 'CreateAsset' })
  async createAsset(@Args('createAssetInput') createAssetInputDto: CreateAssetInputDto): Promise<Asset> {
    let createdAsset = await this.assetService.create(createAssetInputDto);
    let statusLogs = AssetMapper.toStatusLogsResponse(createdAsset.status_logs as [StatusDocument]);
    return AssetMapper.toAssetResponse(createdAsset, statusLogs);
  }

  @Mutation(() => Asset, { name: 'UpdateAsset' })
  async updateAsset(
    @Args('_id') id: string,
    @Args('updateAssetInputDto') updateAssetInputDto: UpdateAssetInputDto
  ): Promise<Asset> {
    let currentAsset = await this.assetService.getAsset({ _id: id });
    if (!currentAsset) {
      throw new NotFoundException('Asset not found');
    }

    let updatedAsset = await this.assetService.update(currentAsset, updateAssetInputDto);
    let statusLogs = AssetMapper.toStatusLogsResponse(updatedAsset.status_logs as [StatusDocument]);

    return AssetMapper.toAssetResponse(updatedAsset, statusLogs);
  }

  @Mutation(() => String, { name: 'DeleteAsset' })
  async deleteAsset(@Args('_id') id: string): Promise<string> {
    let currentAsset = await this.assetService.getAsset({ _id: id });
    if (!currentAsset) {
      throw new NotFoundException('Asset not found');
    }

    await this.assetService.softDeleteVideo(currentAsset);
    return 'Video deleted successfully';
  }

  @Query(() => PaginatedAssetResponse, { name: 'ListAsset' })
  async listAssets(@Args('listAssetInputDto') listAssetInputDto: ListAssetInputDto): Promise<PaginatedAssetResponse> {
    let paginatedResult = await this.assetService.listVideos(listAssetInputDto);
    return AssetMapper.toPaginatedAssetResponse(paginatedResult);
  }

  @Query(() => Asset, { name: 'GetAsset' })
  async getAsset(@Args('getAssetInputDto') getAssetInputDto: GetAssetInputDto): Promise<Asset> {
    let asset = await this.assetService.getAsset(getAssetInputDto);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    let statusLogs = AssetMapper.toStatusLogsResponse(asset.status_logs as [StatusDocument]);

    return AssetMapper.toAssetResponse(asset, statusLogs);
  }
}
