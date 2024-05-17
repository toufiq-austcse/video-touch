import { All, Controller, Head, Req, Res } from '@nestjs/common';
import { TusService } from '@/src/api/assets/services/tus.service';
import { Request, Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private tusService: TusService) {}

  @All()
  async uploadFile(@Req() req: Request, @Res() res: Response) {
    console.log('called ');
    try {
      return this.tusService.handleTus(req, res);
      //   res.status(200).send('File uploaded successfully');
    } catch (error) {
      res.status(500).send('An error occurred while uploading the file');
    }
  }

  @All('*')
  async uploadFileParts(@Req() req: Request, @Res() res: Response) {
    console.log('called ');
    try {
      return this.tusService.handleTus(req, res);
      //res.status(200).send('File uploaded successfully');
    } catch (error) {
      res.status(500).send('An error occurred while uploading the file');
    }
  }

  @Head('*')
  async uploadFilePartsA(@Req() req: Request, @Res() res: Response) {
    console.log('called ');
    try {
      return this.tusService.handleTus(req, res);
      // res.status(200).send('File uploaded successfully');
    } catch (error) {
      res.status(500).send('An error occurred while uploading the file');
    }
  }

  //
  // @Post('upload')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: multer.diskStorage({
  //       destination: function (req, file, cb) {
  //         if (!fs.existsSync(process.env.TEM_UPLOAD_FOLDER)) {
  //           fs.mkdirSync(process.env.TEM_UPLOAD_FOLDER);
  //         }
  //         cb(null, process.env.TEM_UPLOAD_FOLDER);
  //       },
  //       filename: function (req, file, cb) {
  //         const newFileName = getServerFileName(file.originalname);
  //         cb(null, newFileName);
  //       },
  //     }),
  //   })
  // )
  // async uploadAsset(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: +process.env.MAX_VIDEO_SIZE_IN_BYTES }),
  //         new FileTypeValidator({ fileType: 'video/mp4' }),
  //       ],
  //     })
  //   )
  //   file: Express.Multer.File,
  //   @Body() body: UploadAssetReqDto
  // ) {
  //   let data = await this.assetService.createAssetFromUploadReq(body, file);
  //   return data;
  // }
}
