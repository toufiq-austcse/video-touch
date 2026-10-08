import { Injectable } from '@nestjs/common';
import { Constants } from 'video-touch-common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { SLA_DIGEST_MAX_ROWS } from '@/src/api/sla/sla.constants';
import { SlaAlertContext } from '@/src/api/sla/models/sla-alert-context.model';

const TITLE_MAX_LENGTH = 80;
// Slack limits a section's text to 3000 characters, so long digests are split across sections.
const DIGEST_ROWS_PER_SECTION = 10;

/** Builds Slack Block Kit payloads. No I/O: callers pass in everything to render. */
@Injectable()
export class SlaAlertFormatterService {
  buildSingle(ctx: SlaAlertContext): Record<string, any> {
    const target = AppConfigService.appConfig.SLA_TARGET_MINUTES;
    const headline = `SLA warning: video not ready after ${ctx.elapsedMinutes} min (SLA ${target} min)`;
    const timeLeft = Math.max(0, target - ctx.elapsedMinutes);

    return {
      text: `:warning: ${headline}: ${this.title(ctx.asset.title)}`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: `:warning: ${headline}`, emoji: true } },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Title:*\n${this.title(ctx.asset.title)}` },
            { type: 'mrkdwn', text: `*Asset ID:*\n${ctx.asset._id.toString()}` },
            { type: 'mrkdwn', text: `*Status:*\n${ctx.asset.latest_status}` },
            { type: 'mrkdwn', text: `*Started:*\n${this.utc(ctx.asset.sla_started_at)}` },
            { type: 'mrkdwn', text: `*Time left:*\n~${timeLeft} min` },
            { type: 'mrkdwn', text: `*Owner:*\n${this.escape(ctx.ownerEmail ?? 'unknown')}` },
          ],
        },
        { type: 'section', text: { type: 'mrkdwn', text: `*Files:* ${this.files(ctx.files)}` } },
      ],
    };
  }

  buildDigest(items: SlaAlertContext[], thresholdMinutes: number): Record<string, any> {
    const target = AppConfigService.appConfig.SLA_TARGET_MINUTES;
    const headline = `${items.length} videos not ready after ${thresholdMinutes} min (SLA ${target} min). Possible systemic issue`;

    const rows = items
      .slice(0, SLA_DIGEST_MAX_ROWS)
      .map(
        (item) =>
          `\`${this.title(item.asset.title)}\` | ${item.asset._id.toString()} | ${item.asset.latest_status} | ${
            item.elapsedMinutes
          } min`
      );
    if (items.length > SLA_DIGEST_MAX_ROWS) {
      rows.push(`…and ${items.length - SLA_DIGEST_MAX_ROWS} more`);
    }

    const sections = [];
    for (let i = 0; i < rows.length; i += DIGEST_ROWS_PER_SECTION) {
      sections.push({
        type: 'section',
        text: { type: 'mrkdwn', text: rows.slice(i, i + DIGEST_ROWS_PER_SECTION).join('\n') },
      });
    }

    return {
      text: `:rotating_light: ${headline}`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: `:rotating_light: ${headline}`, emoji: true } },
        ...sections,
      ],
    };
  }

  buildTest(): Record<string, any> {
    return { text: '[TEST] Video Touch SLA alerts are connected to this channel.' };
  }

  private files(files: SlaAlertContext['files']): string {
    const shown = files
      .filter((f) => f.type !== Constants.FILE_TYPE.PARTIAL_TRANSCRIPT)
      .sort((a, b) => this.fileOrder(a) - this.fileOrder(b))
      .map((f) => `${f.type === Constants.FILE_TYPE.PLAYLIST ? `${f.height}p` : f.type} ${f.latest_status}`);
    return shown.length ? shown.join(', ') : 'none yet';
  }

  // Playlists first, lowest resolution first; other file types after them.
  private fileOrder(f: SlaAlertContext['files'][number]): number {
    return f.type === Constants.FILE_TYPE.PLAYLIST ? f.height : 100000;
  }

  private title(title: string): string {
    const cut = title.length > TITLE_MAX_LENGTH ? `${title.slice(0, TITLE_MAX_LENGTH - 1)}…` : title;
    return this.escape(cut);
  }

  private escape(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private utc(date: Date): string {
    return `${new Date(date).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
  }
}
