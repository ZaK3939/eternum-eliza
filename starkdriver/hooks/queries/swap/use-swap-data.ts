import useSWR from "swr";

export const useSwapData = ({ 
    inputMint, 
    outputMint, 
    inputAmount, 
    slippageBps,
    userPublicKey,
}: { 
    inputMint: string, 
    outputMint: string, 
    inputAmount: number, 
    slippageBps: number,
    userPublicKey: string,
}) => {

    const { data, isLoading, error } = useSWR(`/api/build-transaction/swap`, async (url: string) => fetch(url, {
        method: "POST",
        body: JSON.stringify({
            inputMint,
            outputMint,
            inputAmount,
            slippageBps,
            userPublicKey,
        }),
    }).then(res => res.json()));

    return { data, isLoading, error };
}