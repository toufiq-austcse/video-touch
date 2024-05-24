import { All, Controller, Req, Res } from '@nestjs/common';
import { TusService } from '@/src/api/assets/services/tus.service';
import { Request, Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private tusService: TusService) {}

  @All(['files', 'files/*'])
  async uploadFileParts(@Req() req: Request, @Res() res: Response) {
    return this.tusService.handleTus(req, res);
  }
}
