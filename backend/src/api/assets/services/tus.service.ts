import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import { Request, Response } from 'express';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { getLocalVideoRootPath } from '@/src/common/utils';
import fs from 'fs';
import { VIDEO_STATUS } from '@/src/common/constants';

@Injectable()
export class TusService {
  private tusServer: Server;

  constructor(private assetService: AssetService) {
    this.tusServer = new Server({
      onUploadCreate: async (req, res, upload) => {
        if (upload.size > AppConfigService.appConfig.MAX_VIDEO_SIZE_IN_BYTES) {
          throw { status_code: HttpStatus.BAD_REQUEST, body: 'Too large file' };
        }

        let createdAsset = await this.assetService.createAssetFromUploadReq({
          file_name: upload.metadata['filename'],
        });
        upload.id = `${createdAsset._id.toString()}.mp4`;
        upload.metadata['db_id'] = createdAsset._id.toString();
        return res;
      },
      onUploadFinish: async (req, res, upload) => {
        let assetId = upload.metadata['db_id'].toString();
        await this.moveFile(assetId, upload.id);

        await this.assetService.updateAssetStatus(
          upload.metadata['db_id'],
          VIDEO_STATUS.UPLOADED,
          'Video uploaded successfully'
        );
        return res;
      },
      path: '/upload/files',
      datastore: new FileStore({ directory: `./${AppConfigService.appConfig.TEMP_UPLOAD_FOLDER}` }),
    });
  }

  async handleTus(@Req() req: Request, @Res() res: Response) {
    return this.tusServer.handle(req, res);
  }

  async moveFile(assetId: string, uploadId: string) {
    let rootPath = getLocalVideoRootPath(assetId);
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }
    let sourceFilePath = `${AppConfigService.appConfig.TEMP_UPLOAD_FOLDER}/${uploadId}`;
    let destinationFilePath = `${rootPath}/${assetId.toString()}.mp4`;
    fs.renameSync(sourceFilePath, destinationFilePath);
  }
}
