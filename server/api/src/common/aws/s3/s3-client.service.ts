import { Injectable, OnModuleInit } from '@nestjs/common';
import fs from 'fs';
import * as AWS from 'aws-sdk';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { UploadObjModel } from '@/src/common/aws/s3/models/upload-obj.model';
import { Models, Utils } from 'video-touch-common';

@Injectable()
export class S3ClientService implements OnModuleInit {
  private s3: AWS.S3;

  constructor() {}

  onModuleInit() {
    this.s3 = new AWS.S3({
      accessKeyId: AppConfigService.appConfig.AWS_ACCESS_KEY_ID,
      secretAccessKey: AppConfigService.appConfig.AWS_SECRET_ACCESS_KEY,
      region: AppConfigService.appConfig.AWS_REGION,
      httpOptions: {
        timeout: 0,
      },
    });
  }

  async uploadObject(uploadObjectS3Dto: UploadObjModel, removeSourceFile: boolean = false) {
    let { bucket, key, filePath, acl, contentType } = uploadObjectS3Dto;
    // let data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    try {
      let params = {
        Bucket: bucket,
        Key: key,
        Body: fs.createReadStream(filePath),
        ACL: acl,
        ContentType: contentType,
      };

      let res = await this.s3.upload(params).promise();
      if (removeSourceFile) {
        this.removeFile(filePath);
      }
      return res;
    } catch (e: any) {
      throw new Error(e);
    }
  }

  removeFile(filePath) {
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
  }

  buildUploadObjModel(data: Models.VideoUploadJobModel, localFilePath: string): UploadObjModel {
    return {
      bucket: AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
      key: `video-touch/${data.asset_id}`,
      filePath: localFilePath,
      acl: 'public-read',
      contentType: 'video/mp4',
    };
  }

  async syncMainManifestFile(assetId: string) {
    let mainManifestPath = Utils.getMainManifestPath(assetId, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
    let s3ManifestPath = Utils.getS3ManifestPath(assetId);
    let res = await this.uploadObject({
      bucket: AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
      key: s3ManifestPath,
      filePath: mainManifestPath,
      acl: 'public-read',
      contentType: 'application/vnd.apple.mpegurl',
    });
    console.log('manifest uploaded:', res);
    return res;
  }

  async generateSignedUrlToGetObject(
    bucket: string,
    key: string,
    expiresIn: number = 3600 // Default to 1 hour
  ): Promise<string> {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL for ${key}`);
    }
  }
}
