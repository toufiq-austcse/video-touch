import { CreateWebhookInputDto } from '@/src/api/webhook/dto/create-webhook-input.dto';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { WebHookDocument } from '@/src/api/webhook/schemas/webhook.schema';
import { Webhook } from '@/src/api/webhook/models/webhook.model';

export class WebhookMapper {
  static buildWebhookDocumentForSaving(
    createWebhookInput: CreateWebhookInputDto,
    user: UserDocument
  ): Omit<WebHookDocument, '_id'> {
    return {
      user_id: user._id,
      url: createWebhookInput.url,
      secret_token: createWebhookInput.secret_token,
    };
  }

  static toWebhookResponse(webhookDocument: WebHookDocument): Webhook {
    return {
      _id: webhookDocument._id.toString(),
      url: webhookDocument.url,
      secret_token: webhookDocument.secret_token,
      created_at: webhookDocument.createdAt,
      updated_at: webhookDocument.updatedAt,
    };
  }
}
