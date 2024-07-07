import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import { Request, Response } from 'express';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { AssetService } from '@/src/api/assets/services/asset.service';
import fs from 'fs';
import mv from 'mv';
import { Constants, Utils } from '@toufiq-austcse/video-touch-common';

@Injectable()
export class TusService {
  private tusServer: Server;

  constructor(private assetService: AssetService) {
    this.tusServer = new Server({
      onUploadCreate: async (req, res, upload) => {
        console.log(upload.size, AppConfigService.appConfig.MAX_VIDEO_SIZE_IN_BYTES);
        if (upload.size > AppConfigService.appConfig.MAX_VIDEO_SIZE_IN_BYTES) {
          throw { status_code: HttpStatus.PAYLOAD_TOO_LARGE, body: 'Too large file' };
        }
        let createdAsset = await this.assetService.createAssetFromUploadReq(
          {
            file_name: upload.metadata['filename'],
          },
          req['user']
        );
        upload.id = `${createdAsset._id.toString()}.mp4`;
        upload.metadata['db_id'] = createdAsset._id.toString();
        return res;
      },
      onUploadFinish: async (req, res, upload) => {
        let assetId = upload.metadata['db_id'].toString();
        await this.moveFile(assetId, upload.id);

        await this.assetService.updateAssetStatus(
          upload.metadata['db_id'],
          Constants.VIDEO_STATUS.UPLOADED,
          'Video uploaded successfully'
        );
        return res;
      },
      path: '/upload/files',
      datastore: new FileStore({
        directory: Utils.getTempLocalUploadDirectory(AppConfigService.appConfig.TEMP_UPLOAD_DIRECTORY),
      }),
    });
  }

  async handleTus(@Req() req: Request, @Res() res: Response) {
    return this.tusServer.handle(req, res);
  }

  async moveFile(assetId: string, uploadId: string) {
    let rootPath = Utils.getLocalVideoRootPath(assetId, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }
    let sourceFilePath = `${Utils.getTempLocalUploadDirectory(
      AppConfigService.appConfig.TEMP_UPLOAD_DIRECTORY
    )}/${uploadId}`;
    let destinationFilePath = `${rootPath}/${assetId.toString()}.mp4`;
    console.log('renaming file', sourceFilePath, destinationFilePath);
    await this.promiseMv(sourceFilePath, destinationFilePath);
    fs.unlinkSync(`${sourceFilePath}.json`);
  }

  async promiseMv(sourceFilePath: string, destinationFilePath: string) {
    return new Promise((resolve, reject) => {
      mv(sourceFilePath, destinationFilePath, { mkdirp: true }, (err) => {
        if (!err) {
          resolve(`file moved to ${destinationFilePath}`);
        } else {
          console.error('error in moving file', err);
          reject(err);
        }
      });
    });
  }
}
