## Description

Rapport helps mobile nodes open channels and access inbound liquidity.

## Rationale

For new users, with no access to bitcoin, this gives ready access to a good first channel with enough liquidity to test with.
It can also be used to gift wallet users with their first testnet sats so they aren't starting from zero.

## Installation

```bash
$ yarn install
```

## Setup your env

Copy `env.sample` to `.env` and add credentials to authenticate the remote LND node.

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## First channel

Authenticated LND node opens a zero conf channel with the mobile LDK node.

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"mobileNode" : "029f5b1676a29ca7ea43de6b5034904f3b4a03619d5d17fe71bdeaa7627ac9c8b1"}' \
  http://localhost:4545/api/v1/open
```

## Subsequent channels

This uses hodl invoices to open new zero-conf channels when inbound liquidity dips. It takes a BOLT11 `request` and returns a wrapped (hodl) invoice which once paid, opens a channel and settles the original invoice, forwarding the initial amount requested through a fresh channel with more inbound liquidity.

Optional args:

- `skipProbe` (boolean, default=false): Whether to probe route to mobile node before creating hodl invoice. 
- `feeInclusive` (boolean, default=false): Whether or not to add routing fees to the service fee when creating wrapped invoice
- `fee` (number in millisats, default=0): Service fee to charge for channel open.

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"request":"lntb50u1pjjval6dpq2ajkccm0d4jjqar0ypkxjemgw3hxjmn8np4q204k9nk52w206jrme44qdysfua55qmpn4w30ln3hh42wcn6e8ytzpp5dmpks2mkps82uvsgvavpdug38d70q4t3txc92nxyzncwf0slctsqsp5esw9r0k843qqy72pt9w6qfsqa35wk6jsnrs64m7t959d0anrnuss9qyysgqcqpcxqrrssp50u4fazmsn2gqnzavknt879ly25h0qjhh37940u0c38nxp3qxtks8u9jl5psnqensj3976aetq8p0jnep6e7fn9zqeuev0pv9j5ntsp6yg696", "skipProbe": false, "feeInclusive": true, "fee": 2500000}' \
  http://localhost:4545/api/v1/new
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

Rapport is [MIT licensed](LICENSE).
