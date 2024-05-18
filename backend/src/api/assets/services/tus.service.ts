import { Injectable, Res, Req } from '@nestjs/common';
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import { Request, Response } from 'express';
import { getServerFileName } from '@/src/common/utils';

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

  constructor() {
    this.tusServer = new Server({
      namingFunction: this.fileNameFromRequest,
      path: '/upload/files',
      datastore: new FileStore({ directory: './uploads' })
    });
  }

  async handleTus(@Req() req: Request, @Res() res: Response) {
    return this.tusServer.handle(req, res);
  }

  private fileNameFromRequest = (req) => {
    try {
      const metadata = this.getFileMetadata(req);
      return getServerFileName(metadata.filename);
    } catch (e) {
      //this.logger.error(e);

      // rethrow error
      throw e;
    }
  };

  private getFileMetadata(req: any): FileMetadata {
    const uploadMeta: string = req.header('Upload-Metadata');
    const metadata = new FileMetadata();

    uploadMeta.split(',').map((item) => {
      const tmp = item.split(' ');
      const key = tmp[0];
      const value = Buffer.from(tmp[1], 'base64').toString('ascii');
      metadata[`${key}`] = value;
    });

    let extension: string = metadata.name ? metadata.name.split('.').pop() : null;
    extension = extension && extension.length === 3 ? extension : null;
    metadata.extension = extension;

    return metadata;
  }
}
