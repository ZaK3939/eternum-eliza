export const MINT_NFT_PROMPT = `
This tool will mint an NFT (ERC-721) to a specified destination address onchain via a contract invocation. 
It takes the contract address of the NFT onchain and the destination address onchain that will receive the NFT as inputs. 
Do not use the contract address as the destination address. If you are unsure of the destination address, please ask the user before proceeding.
`; 