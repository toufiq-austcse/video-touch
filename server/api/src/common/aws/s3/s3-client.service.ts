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

  async getAllDirectories(path: string, bucket?: string): Promise<string[]> {
    const bucketName = bucket || AppConfigService.appConfig.AWS_S3_BUCKET_NAME;
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: bucketName,
      Prefix: path,
      Delimiter: '/',
    };

    console.log('params', params);
    try {
      const allKeys: string[] = [];
      let isTruncated = true;
      let continuationToken: string | undefined;

      // Handle pagination by making multiple requests if necessary
      while (isTruncated) {
        if (continuationToken) {
          params.ContinuationToken = continuationToken;
        }

        const response = await this.s3.listObjectsV2(params).promise();

        // Process CommonPrefixes which represent directories
        if (response.CommonPrefixes) {
          // Extract just the directory names (not full paths)
          const directories = response.CommonPrefixes.map((prefix) => {
            // Get the directory name from the prefix
            const fullPath = prefix.Prefix as string;
            // Remove the input path prefix to get just the directory name
            let dirName = fullPath.replace(path, '');
            // Remove trailing slash if present
            dirName = dirName.replace(/\/$/, '');
            return dirName;
          }).filter((dir) => dir.length > 0); // Filter out empty strings

          allKeys.push(...directories);
        }

        // Check if there are more results to fetch
        isTruncated = response.IsTruncated || false;
        continuationToken = response.NextContinuationToken;
      }

      return allKeys;
    } catch (error) {
      console.error('Error listing objects in S3:', error);
      throw new Error(`Failed to list objects with prefix ${path} in bucket ${bucketName}`);
    }
  }
}
