import { AuthenticatedLnd, openChannel } from 'lightning';

import { ValidationError } from '../errors';
import { DEFAULT_FEE_RATE, DEFAULT_INBOUND_LIQUIDITY } from 'src/config';

interface Args {
  lnd: AuthenticatedLnd;
  mobileNode: string;
}

export default async function ({ lnd, mobileNode }: Args) {
  if (!lnd) {
    throw new ValidationError('ExpectedAuthenticatedLndToCreateHodlInvoice');
  }

  if (!mobileNode) {
    throw new ValidationError('ExpectedMobileNodePubKeyToCreateChannel');
  }

  const result = await openChannel({
    lnd,
    description: 'EttaWalletMobile',
    local_tokens: DEFAULT_INBOUND_LIQUIDITY,
    partner_public_key: mobileNode,
    is_private: true,
    is_trusted_funding: true,
    fee_rate: DEFAULT_FEE_RATE,
  });

  return result;
}
