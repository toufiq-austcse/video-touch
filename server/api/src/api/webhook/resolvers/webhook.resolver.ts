import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Webhook } from '@/src/api/webhook/models/webhook.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/src/api/auth/guards/gql-auth.guard';
import { UserInfoDec } from '@/src/common/decorators/user-info.decorator';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { CreateWebhookInputDto } from '@/src/api/webhook/dto/create-webhook-input.dto';
import { WebhookService } from '@/src/api/webhook/services/webhook.service';
import { WebhookMapper } from '@/src/api/webhook/mapper/webhook.mapper';

@Resolver(() => Webhook)
export class WebhookResolver {
  constructor(private webhookService: WebhookService) {}
  @Mutation(() => Webhook, { name: 'CreateWebhook' })
  @UseGuards(GqlAuthGuard)
  async create(
    @Args('createWebhookInput') createWebhookInputDto: CreateWebhookInputDto,
    @UserInfoDec() user: UserDocument
  ) {
    let newWebhook = await this.webhookService.create(createWebhookInputDto, user);

    return WebhookMapper.toWebhookResponse(newWebhook);
  }
}
