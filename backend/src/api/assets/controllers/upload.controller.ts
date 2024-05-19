import { All, Controller, Head, Post, Req, Res } from '@nestjs/common';
import { TusService } from '@/src/api/assets/services/tus.service';
import { Request, Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private tusService: TusService) {}

  @Post('files')
  async uploadFile(@Req() req: Request, @Res() res: Response) {
    console.log('called ');
    try {
      return this.tusService.handleTus(req, res);
      //   res.status(200).send('File uploaded successfully');
    } catch (error) {
      res.status(500).send('An error occurred while uploading the file');
    }
  }

  @All('files/*')
  async uploadFileParts(@Req() req: Request, @Res() res: Response) {
    console.log('called ');
    try {
      return this.tusService.handleTus(req, res);
      //res.status(200).send('File uploaded successfully');
    } catch (error) {
      res.status(500).send('An error occurred while uploading the file');
    }
  }

  @Head('files/*')
  async uploadFilePartsA(@Req() req: Request, @Res() res: Response) {
    console.log('called ');
    try {
      return this.tusService.handleTus(req, res);
      // res.status(200).send('File uploaded successfully');
    } catch (error) {
      res.status(500).send('An error occurred while uploading the file');
    }
  }
}
