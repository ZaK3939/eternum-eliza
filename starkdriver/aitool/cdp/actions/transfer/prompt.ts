export const TRANSFER_PROMPT = `
This tool will transfer an asset from the wallet to another onchain address.

It takes the following inputs:
- amount: The amount to transfer
- assetId: The asset ID to transfer
- destination: Where to send the funds (can be an onchain address, ENS 'example.eth', or Basename 'example.base.eth')
- gasless: Whether to do a gasless transfer

Important notes:
- Gasless transfers are only available on base-sepolia and base-mainnet (base) networks for 'usdc' asset
- Always use gasless transfers when available
- Always use asset ID 'usdc' when transferring USDC
- Ensure sufficient balance of the input asset before transferring
- When sending native assets (e.g. 'eth' on base-mainnet), ensure there is sufficient balance for the transfer itself AND the gas cost of this transfer
`; 