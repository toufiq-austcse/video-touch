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
import { FileService } from '@/src/api/assets/services/file.service';

@Resolver(() => Asset)
export class AssetResolver {
  constructor(private assetService: AssetService, private fileService: FileService, private assetMapper: AssetMapper) {
  }

  @Mutation(() => CreateAssetResponse, { name: 'CreateAsset' })
  async createAsset(@Args('createAssetInput') createAssetInputDto: CreateAssetInputDto): Promise<Asset> {
    let createdAsset = await this.assetService.create(createAssetInputDto);
    let statusLogs = this.assetMapper.toStatusLogsResponse(createdAsset.status_logs as [StatusDocument]);
    let thumbnailFile = await this.fileService.getThumbnailFile(createdAsset._id.toString());
    return this.assetMapper.toAssetResponse(createdAsset, statusLogs, thumbnailFile);
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
    let statusLogs = this.assetMapper.toStatusLogsResponse(updatedAsset.status_logs as [StatusDocument]);
    let thumbnailFile = await this.fileService.getThumbnailFile(updatedAsset._id.toString());

    return this.assetMapper.toAssetResponse(updatedAsset, statusLogs, thumbnailFile);
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
    let thumbnailFile = await this.fileService.getThumbnailFile(asset._id.toString());

    return this.assetMapper.toAssetResponse(asset, statusLogs, thumbnailFile);
  }
}
