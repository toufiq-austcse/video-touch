import { Injectable, OnModuleInit } from '@nestjs/common';
import fs from 'fs';
import * as AWS from 'aws-sdk';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { UploadObjModel } from '@/src/common/aws/s3/models/upload-obj.model';


@Injectable()
export class S3ClientService implements OnModuleInit {
  private s3: AWS.S3;

  constructor() {
  }

  onModuleInit() {
    this.s3 = new AWS.S3({
      accessKeyId: AppConfigService.appConfig.AWS_ACCESS_KEY_ID,
      secretAccessKey: AppConfigService.appConfig.AWS_SECRET_ACCESS_KEY,
      region: AppConfigService.appConfig.AWS_REGION,
      httpOptions: {
        timeout: 0
      }
    });
  }

  async uploadObject(uploadObjectS3Dto: UploadObjModel, removeSourceFile: boolean = false) {
    let { bucket, key, filePath, contentType } = uploadObjectS3Dto;
    // let data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    try {
      let params = {
        Bucket: bucket,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: contentType
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

}
