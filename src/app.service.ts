import { Injectable, Logger } from '@nestjs/common';
import authenticatedLnd from './lnd';
import {
  CreateHodlInvoiceResult,
  OpenChannelResult,
  getWalletInfo,
} from 'lightning';
import { httpLogger } from './utils';
import { channelDto, hodlChannelDto } from './class_controller';
import { createChannel, createHodlInvoice } from './methods';

@Injectable()
export class AppService {
  async onModuleInit() {
    try {
      const { lnd } = await authenticatedLnd({});
      const result = await getWalletInfo({ lnd });

      Logger.log({
        is_authenticated_to_lnd: true,
        pubkey: result.public_key,
        alias: result.alias || undefined,
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async openChannel(args: channelDto): Promise<OpenChannelResult> {
    try {
      const { lnd } = await authenticatedLnd({});

      return await createChannel({
        lnd,
        ...args,
      });
    } catch (error) {
      httpLogger(error);
    }
  }

  async getHodlChannel(args: hodlChannelDto): Promise<CreateHodlInvoiceResult> {
    try {
      const { lnd } = await authenticatedLnd({});

      return await createHodlInvoice({
        lnd,
        ...args,
      });
    } catch (error) {
      httpLogger(error);
    }
  }
}
