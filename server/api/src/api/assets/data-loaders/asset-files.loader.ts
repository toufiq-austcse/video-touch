import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { File } from '@/src/api/assets/models/file.model';
import { FileMapper } from '@/src/api/assets/mapper/file.mapper';
import mongoose from 'mongoose';

@Injectable({ scope: Scope.REQUEST })
export class FilesByAssetLoader extends DataLoader<string, File[]> {
  constructor(private fileRepository: FileRepository) {
    super((keys) => this.batchLoadFn(keys));
  }

  private async batchLoadFn(assetIds: readonly string[]): Promise<File[][]> {
    let assetIdsInObjectIds = assetIds.map((assetId) => mongoose.Types.ObjectId(assetId));
    let response: File[][] = [];
    let files = await this.fileRepository.find({
      asset_id: { $in: assetIdsInObjectIds }
    });

    for (let assetId of assetIds) {
      let fileResponse: File[] = [];

      let assetsFiles = files.filter((file) => file.asset_id.toString() === assetId);
      for (let assetFile of assetsFiles) {
        fileResponse.push(FileMapper.toFileResponse(assetFile));
      }

      response.push(fileResponse);
    }

    return response;

  }
}
