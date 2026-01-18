import { NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { File } from '../models/file.model';
import { FileRepository } from '../repositories/file.repository';
import { FileService } from '@/src/api/assets/services/file.service';

@Resolver(() => File)
export class FileResolver {
  constructor(private fileService: FileService, private fileRepository: FileRepository) {}

  @Query(() => String, { name: 'GetFileUrl' })
  async getFileUrl(@Args('id') fileId: string) {
    let file = await this.fileRepository.findOne({ _id: Types.ObjectId(fileId) });
    if (!file) {
      throw new NotFoundException('file not found');
    }
    return this.fileService.getCdnFileUrl(file);
  }
}
