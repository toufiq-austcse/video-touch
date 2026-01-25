import { Injectable } from '@nestjs/common';
import { WebhookResponseRepository } from '@/src/api/webhook/repositories/webhook-response.repository';
import { WebhookResponseDocument } from '@/src/api/webhook/schemas/webhook-response.schema';
import { WebhookPayloadDto } from '@/src/api/webhook/dto/webhook-payload.dto';
import { AxiosError } from 'axios';
import mongoose from 'mongoose';

@Injectable()
export class WebhookResponseService {
  constructor(private webhookResponseRepository: WebhookResponseRepository) {}

  async create(options: {
    user_id: string;
    asset_id: string;
    event_type: string;
    webhook_id: string;
    identification_type: string;
    identification_value: string;
    payload: WebhookPayloadDto;
    status: string;
    responseBody: any;
    error?: unknown;
  }): Promise<WebhookResponseDocument> {
    const { response, errorData } = this.processError(options.responseBody, options.error);

    return this.webhookResponseRepository.create({
      user_id: mongoose.Types.ObjectId(options.user_id),
      asset_id: mongoose.Types.ObjectId(options.asset_id),
      webhook_id: mongoose.Types.ObjectId(options.webhook_id),
      event_type: options.event_type,
      identification_type: options.identification_type,
      identification_value: options.identification_value,
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
