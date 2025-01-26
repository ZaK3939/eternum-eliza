import useSWR from "swr";

export const useTransferData = ({ 
    from, 
    to,
    amount,
    mint,
}: { 
    from: string, 
    to: string,
    amount: number,
    mint?: string,
}) => {

    const { data, isLoading, error } = useSWR(`/api/build-transaction/transfer`, (url: string) => fetch(url, {
        method: "POST",
        body: JSON.stringify({
            from,
            to,
            amount,
            mint,
        }),
    }).then(res => res.json()));

    return { data, isLoading, error };
}