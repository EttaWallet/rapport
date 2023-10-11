/*
 * Initial version based on lnproxy-ts: v0l/lnproxy-ts
 * https://github.com/v0l/lnproxy-ts/blob/master/src/offchain/subscribe_to_invoices.ts
 */

import {
  AuthenticatedLnd,
  SubscribeToInvoiceInvoiceUpdatedEvent,
  cancelHodlInvoice,
  payViaPaymentRequest,
  settleHodlInvoice,
  subscribeToInvoice,
} from 'lightning';
import { Logger } from '@nestjs/common';
import { TimeoutError, ValidationError } from '../errors';
import { createChannel } from '.';

type Args = {
  expiry: string;
  id: string;
  lnd: AuthenticatedLnd;
  request: string;
  maxFee: number;
  partnerPubKey: string;
};

export default function ({
  expiry,
  id,
  lnd,
  maxFee,
  request,
  partnerPubKey,
}: Args) {
  if (!expiry) {
    throw new ValidationError('ExpectedHodlInvoiceExpiryToSubscribeToInvoices');
  }
  if (!id) {
    throw new ValidationError('ExpectedInvoiceIdToSubscribeToInvoices');
  }
  if (!lnd) {
    throw new ValidationError('ExpectedAuthenticatedLndToSubscribeToInvoices');
  }
  return new Promise<void>((resolve, reject) => {
    const sub = subscribeToInvoice({ id, lnd });

    // Stop listening for the HTLC when the invoice expires
    const timeout = setTimeout(
      async () => {
        sub.removeAllListeners();
        await finished(new TimeoutError('TimedOutWaitingForPayment'));
      },
      new Date(expiry).getTime() - new Date().getTime(),
    );

    const finished = async (
      err?: Error,
      res?: SubscribeToInvoiceInvoiceUpdatedEvent,
    ) => {
      clearTimeout(timeout);
      Logger.log(`Payment finished: ${id}`, err, res);
      sub.removeAllListeners();

      if (err || (!err && !res)) {
        try {
          await cancelHodlInvoice({ id, lnd });
        } catch (err) {
          return reject(err);
        }
      }
      resolve();
    };

    sub.on(
      'invoice_updated',
      async (req: SubscribeToInvoiceInvoiceUpdatedEvent) => {
        try {
          Logger.log(req.payments);
          const paid = req.payments
            .filter((v) => v.is_held)
            .reduce((acc, v) => acc + BigInt(v.mtokens), BigInt(0));
          const minAmount = BigInt(req.mtokens);
          if (paid >= minAmount) {
            Logger.log(`Attempting payment: ${id}, maxFee=${maxFee}`);
            const result = await payViaPaymentRequest({
              lnd,
              request,
              max_fee: maxFee,
            });

            Logger.log(`Payment result: ${id}`, result);
            if (result.secret) {
              await createChannel({
                lnd,
                mobileNode: partnerPubKey,
              })
                .then((openChannelRes) => {
                  console.log('channel open successful: ', openChannelRes);
                })
                .catch((error: any) => {
                  console.log('error opening channel: ', error.message);
                });
              await settleHodlInvoice({ lnd, secret: result.secret });
              await finished(undefined, req);
            }
          }
        } catch (err) {
          await finished(err as Error);
        }
      },
    );
  });
}
