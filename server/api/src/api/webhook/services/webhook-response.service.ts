import { Injectable } from '@nestjs/common';
import { WebhookResponseRepository } from '@/src/api/webhook/repositories/webhook-response.repository';
import { WebhookResponseDocument } from '@/src/api/webhook/schemas/webhook-response.schema';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';
import { WebhookPayloadDto } from '@/src/api/webhook/dto/webhook-payload.dto';
import { AxiosError } from 'axios';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import mongoose from 'mongoose';

@Injectable()
export class WebhookResponseService {
  constructor(private webhookResponseRepository: WebhookResponseRepository) {}

  async createAssetWebhookResponse(
    assetDocument: AssetDocument,
    status: string,
    payload: WebhookPayloadDto,
    responseBody: any,
    error?: unknown
  ): Promise<WebhookResponseDocument> {
    return this.create({
      user_id: assetDocument.user_id,
      asset_id: assetDocument._id,
      event_type: payload.event_type,
      payload,
      status,
      responseBody,
      error,
    });
  }

  async createFileWebhookResponse(
    fileDocument: FileDocument,
    status: string,
    userId: mongoose.Types.ObjectId,
    payload: WebhookPayloadDto,
    responseBody: any,
    error?: unknown
  ): Promise<WebhookResponseDocument> {
    return this.create({
      user_id: userId,
      asset_id: fileDocument.asset_id,
      event_type: payload.event_type,
      payload,
      status,
      responseBody,
      error,
    });
  }

  private async create(options: {
    user_id: mongoose.Types.ObjectId;
    asset_id: mongoose.Types.ObjectId;
    event_type: string;
    payload: WebhookPayloadDto;
    status: string;
    responseBody: any;
    error?: unknown;
  }): Promise<WebhookResponseDocument> {
    const { response, errorData } = this.processError(options.responseBody, options.error);

    return this.webhookResponseRepository.create({
      user_id: options.user_id,
      asset_id: options.asset_id,
      event_type: options.event_type,
      payload: options.payload,
      status: options.status,
      response,
      error: errorData,
    });
  }

  private processError(responseBody: any, error?: unknown): { response: any; errorData: any } {
    if (!error) {
      return { response: responseBody, errorData: null };
    }

    if (error instanceof AxiosError) {
      return {
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          message: error.message,
        },
        errorData: null,
      };
    }

    if (error instanceof Error) {
      return {
        response: responseBody,
        errorData: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
      };
    }

    return {
      response: responseBody,
      errorData: { error: String(error) },
    };
  }
}
