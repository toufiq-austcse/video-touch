import { Injectable, Req, Res } from '@nestjs/common';
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import { Request, Response } from 'express';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { VIDEO_STATUS } from '@/src/common/constants';
import { getLocalVideoRootPath } from '@/src/common/utils';
import fs from 'fs';

export class FileMetadata {
  public relativePath?: string;
  public name?: string;
  public type?: string;
  public filetype?: string;
  public filename?: string;
  public extension?: string;
}

@Injectable()
export class TusService {
  private tusServer: Server;


  constructor(private assetService: AssetService) {
    this.tusServer = new Server({
      onUploadCreate: async (req, res, upload) => {
        if (upload.size > AppConfigService.appConfig.MAX_VIDEO_SIZE_IN_BYTES) {
          throw { status_code: 400, body: 'Too large file' };
        }

        let createdAsset = await this.assetService.createAssetFromUploadReq({
          file_name: upload.metadata['filename']
        });
        upload.id = `${createdAsset._id.toString()}.mp4`;
        upload.metadata['db_id'] = createdAsset._id.toString();
        return res;
      },
      onUploadFinish: async (req, res, upload) => {
        let assetId = upload.metadata['db_id'].toString();
        let rootPath = getLocalVideoRootPath(assetId);
        if (!fs.existsSync(rootPath)) {
          fs.mkdirSync(rootPath, { recursive: true });
        }
        let sourceFilePath = `uploads/${upload.id}`;
        let destinationFilePath = `${rootPath}/${assetId.toString()}.mp4`;
        console.log('sourceFilePath ', sourceFilePath, ' destinationFilePath ', destinationFilePath);
        fs.renameSync(sourceFilePath, destinationFilePath);

        await this.assetService.updateAssetStatus(upload.metadata['db_id'], VIDEO_STATUS.UPLOADED, 'Video uploaded successfully');
        return res;
      },
      path: '/upload/files',
      datastore: new FileStore({ directory: './uploads' })
    });
  }

  async handleTus(@Req() req: Request, @Res() res: Response) {
    return this.tusServer.handle(req, res);
  }

  // private fileNameFromRequest = (req) => {
  //   try {
  //     const metadata = this.getFileMetadata(req);
  //     return getServerFileName(metadata.filename);
  //   } catch (e) {
  //     //this.logger.error(e);
  //
  //     // rethrow error
  //     throw e;
  //   }
  // };

  // private getFileMetadata(req: any): FileMetadata {
  //   const uploadMeta: string = req.header('Upload-Metadata');
  //   const metadata = new FileMetadata();
  //
  //   uploadMeta.split(',').map((item) => {
  //     const tmp = item.split(' ');
  //     const key = tmp[0];
  //     const value = Buffer.from(tmp[1], 'base64').toString('ascii');
  //     metadata[`${key}`] = value;
  //   });
  //
  //   let extension: string = metadata.name ? metadata.name.split('.').pop() : null;
  //   extension = extension && extension.length === 3 ? extension : null;
  //   metadata.extension = extension;
  //
  //   return metadata;
  // }
}
