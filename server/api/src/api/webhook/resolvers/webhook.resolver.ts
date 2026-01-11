import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Webhook, PaginatedWebhookResponse } from '@/src/api/webhook/models/webhook.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/src/api/auth/guards/gql-auth.guard';
import { UserInfoDec } from '@/src/common/decorators/user-info.decorator';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { CreateWebhookInputDto } from '@/src/api/webhook/dto/create-webhook-input.dto';
import { ListWebhookInputDto } from '@/src/api/webhook/dto/list-webhook-input.dto';
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

  @Query(() => PaginatedWebhookResponse, { name: 'ListWebhook' })
  @UseGuards(GqlAuthGuard)
  async listWebhooks(
    @Args('listWebhookInputDto') listWebhookInputDto: ListWebhookInputDto,
    @UserInfoDec() user: UserDocument
  ): Promise<PaginatedWebhookResponse> {
    let paginatedResult = await this.webhookService.listWebhooks(listWebhookInputDto, user);
    return WebhookMapper.toPaginatedWebhookResponse(paginatedResult);
  }
}
