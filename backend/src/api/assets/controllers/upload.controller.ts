import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { getServerFileName } from '@/src/common/utils';
import fs from 'fs';
import { UploadAssetReqDto } from '@/src/api/assets/dtos/upload-asset-req.dto';


@Controller('assets')
export class UploadController {

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: function(req, file, cb) {
          if (!fs.existsSync(process.env.TEM_UPLOAD_FOLDER)) {
            fs.mkdirSync(process.env.TEM_UPLOAD_FOLDER);
          }
          cb(null, process.env.TEM_UPLOAD_FOLDER);
        },
        filename: function(req, file, cb) {
          const newFileName = getServerFileName(file.originalname);
          cb(null, newFileName);
        }
      })
    })
  )
  async uploadAsset(@UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: +process.env.MAX_VIDEO_SIZE_IN_BYTES }),
      new FileTypeValidator({ fileType: 'video/mp4' })
    ]
  })) file: Express.Multer.File, @Body() body: UploadAssetReqDto) {
    console.log('file ', file);

  }
}