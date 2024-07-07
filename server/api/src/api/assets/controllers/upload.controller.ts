import { All, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { TusService } from '@/src/api/assets/services/tus.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@/src/api/auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private tusService: TusService) {}

  @Post('files')
  @UseGuards(JwtAuthGuard)
  async createFileUpload(@Req() req: Request, @Res() res: Response) {
    return this.tusService.handleTus(req, res);
  }

  @All(['files', 'files/*'])
  async uploadFileParts(@Req() req: Request, @Res() res: Response) {
    return this.tusService.handleTus(req, res);
  }
}
