import { FetchPriceResponse } from "solana-agent-kit";

/**
 * Get the USDC price for a token using Jupiter's price API
 * @param tokenId The token's mint address
 * @returns Price response with USDC price if successful
 */
export async function getPrice(tokenId: string): Promise<FetchPriceResponse> {
  try {
    const response = await fetch(
      `https://api.jup.ag/price/v2?ids=${tokenId}`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !data.data[tokenId]) {
      return {
        status: "error",
        message: "Token price not found",
        code: "TOKEN_NOT_FOUND"
      };
    }

    const price = data.data[tokenId].price;

    return {
      status: "success",
      tokenId,
      priceInUSDC: price
    };

  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      code: "API_ERROR"
    };
  }
}
