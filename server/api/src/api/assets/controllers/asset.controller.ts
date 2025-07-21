import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { CreateAssetInputDto } from '@/src/api/assets/dtos/create-asset-input.dto';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';
import { UserService } from '@/src/api/auth/services/user.service';

@Controller({ version: '1', path: 'assets' })
export class AssetController {
  constructor(private assetService: AssetService, private userService: UserService) {}

  @Post()
  async createAsset(@Body() createAssetInputDto: CreateAssetInputDto) {
    let user = await this.userService.getUserEmail(createAssetInputDto.email);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    let createdAsset = await this.assetService.create(createAssetInputDto, user);
    let statusLogs = AssetMapper.toStatusLogsResponse(createdAsset.status_logs as [StatusDocument]);
    return AssetMapper.toAssetResponse(createdAsset, statusLogs);
  }
}
