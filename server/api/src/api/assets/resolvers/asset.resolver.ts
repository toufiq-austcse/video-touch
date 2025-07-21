import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Asset, CreateAssetResponse, PaginatedAssetResponse } from '../models/asset.model';
import { CreateAssetInputDto, RecreateAssetInputDto } from '../dtos/create-asset-input.dto';
import { AssetService } from '../services/asset.service';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { ListAssetInputDto } from '@/src/api/assets/dtos/list-asset-input.dto';
import { GetAssetInputDto } from '@/src/api/assets/dtos/get-asset-input.dto';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { UpdateAssetInputDto } from '@/src/api/assets/dtos/update-asset-input.dto';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';
import { GqlAuthGuard } from '@/src/api/auth/guards/gql-auth.guard';
import { UserInfoDec } from '@/src/common/decorators/user-info.decorator';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { FileService } from '@/src/api/assets/services/file.service';

@Resolver(() => Asset)
export class AssetResolver {
  constructor(
    private assetService: AssetService,
    private fileService: FileService
  ) {}

  @Mutation(() => CreateAssetResponse, { name: 'CreateAsset' })
  @UseGuards(GqlAuthGuard)
  async createAsset(
    @Args('createAssetInput') createAssetInputDto: CreateAssetInputDto,
    @UserInfoDec() user: UserDocument
  ): Promise<Asset> {
    let createdAsset = await this.assetService.create(createAssetInputDto, user);
    let statusLogs = AssetMapper.toStatusLogsResponse(createdAsset.status_logs as [StatusDocument]);
    return AssetMapper.toAssetResponse(createdAsset, statusLogs);
  }

  @Mutation(() => CreateAssetResponse, { name: 'RecreateAsset' })
  @UseGuards(GqlAuthGuard)
  async recreateAsset(
    @Args('recreateAssetInputDto') recreateAssetInputDto: RecreateAssetInputDto,
    @UserInfoDec() user: UserDocument
  ): Promise<Asset> {
    let currentAsset = await this.assetService.getAsset({ _id: recreateAssetInputDto._id.toString() }, user);
    if (!currentAsset) {
      throw new NotFoundException('Asset not found');
    }
    let sourceFileUrl = await this.fileService.getSourceFileUrlToReProcess(currentAsset);

    let createdAsset = await this.assetService.create(
      {
        title: currentAsset.title,
        description: currentAsset.description,
        source_url: sourceFileUrl,
        tags: currentAsset.tags,
      },
      user
    );
    let statusLogs = AssetMapper.toStatusLogsResponse(createdAsset.status_logs as [StatusDocument]);
    return AssetMapper.toAssetResponse(createdAsset, statusLogs);
  }

  @Mutation(() => Asset, { name: 'UpdateAsset' })
  @UseGuards(GqlAuthGuard)
  async updateAsset(
    @Args('_id') id: string,
    @Args('updateAssetInputDto') updateAssetInputDto: UpdateAssetInputDto,
    @UserInfoDec() user: UserDocument
  ): Promise<Asset> {
    let currentAsset = await this.assetService.getAsset({ _id: id }, user);
    if (!currentAsset) {
      throw new NotFoundException('Asset not found');
    }

    let updatedAsset = await this.assetService.update(currentAsset, updateAssetInputDto);
    let statusLogs = AssetMapper.toStatusLogsResponse(updatedAsset.status_logs as [StatusDocument]);

    return AssetMapper.toAssetResponse(updatedAsset, statusLogs);
  }

  @Mutation(() => String, { name: 'DeleteAsset' })
  @UseGuards(GqlAuthGuard)
  async deleteAsset(@Args('_id') id: string, @UserInfoDec() user: UserDocument): Promise<string> {
    let currentAsset = await this.assetService.getAsset({ _id: id }, user);
    if (!currentAsset) {
      throw new NotFoundException('Asset not found');
    }

    await this.assetService.softDeleteVideo(currentAsset);
    return 'Video deleted successfully';
  }

  @Query(() => PaginatedAssetResponse, { name: 'ListAsset' })
  @UseGuards(GqlAuthGuard)
  async listAssets(
    @Args('listAssetInputDto') listAssetInputDto: ListAssetInputDto,
    @UserInfoDec() user: UserDocument
  ): Promise<PaginatedAssetResponse> {
    let paginatedResult = await this.assetService.listVideos(listAssetInputDto, user);
    return AssetMapper.toPaginatedAssetResponse(paginatedResult);
  }

  @Query(() => Asset, { name: 'GetAsset' })
  @UseGuards(GqlAuthGuard)
  async getAsset(
    @Args('getAssetInputDto') getAssetInputDto: GetAssetInputDto,
    @UserInfoDec() user: UserDocument
  ): Promise<Asset> {
    let asset = await this.assetService.getAsset(getAssetInputDto, user);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    let statusLogs = AssetMapper.toStatusLogsResponse(asset.status_logs as [StatusDocument]);

    return AssetMapper.toAssetResponse(asset, statusLogs);
  }
}
