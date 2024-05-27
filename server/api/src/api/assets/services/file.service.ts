import { Injectable } from '@nestjs/common';
import { FILE_STATUS } from '@/src/common/constants';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import mongoose from 'mongoose';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { AssetService } from '@/src/api/assets/services/asset.service';

@Injectable()
export class FileService {
  constructor(private repository: FileRepository, private assetService: AssetService) {
  }

  async updateFileStatus(assetId: string, height: number, status: string, details: string, size?: number) {
    let updatedData: mongoose.UpdateQuery<FileDocument> = {
      latest_status: status,
      $push: {
        status_logs: {
          status: status,
          details: details
        }
      }
    };
    if (size) {
      updatedData = {
        ...updatedData,
        size: size
      };
    }

    return this.repository.findOneAndUpdate(
      {
        asset_id: mongoose.Types.ObjectId(assetId),
        height: height
      },
      updatedData
    );
  }


  async afterUpdateFileLatestStatus(oldDoc: FileDocument) {
    console.log('oldDoc ', oldDoc);
    let updatedFile = await this.repository.findOne({
      _id: mongoose.Types.ObjectId(oldDoc._id.toString())
    });
    let assetId = updatedFile.asset_id;

    if (updatedFile.latest_status == FILE_STATUS.READY) {
      this.assetService
        .checkForDeleteLocalAssetFile(assetId.toString())
        .then((data) => {
          console.log('checked local video file');
        })
        .catch((err) => {
          console.log('error while checking local file ', err);
        });

      this.assetService.checkForAssetReadyStatus(assetId.toString())
        .then(() => {
          console.log('checked for asset ready status');
        }).catch(err => {
        console.log('error while checking asset ready status', err);

      });
    }
    if (updatedFile.latest_status === FILE_STATUS.FAILED) {
      await this.assetService.checkForAssetFailedStatus(assetId.toString());
    }

  }
}
