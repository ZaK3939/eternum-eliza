import { NextResponse } from "next/server";
import { 
    Connection, 
    PublicKey, 
    SystemProgram, 
    Transaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import { 
    getAssociatedTokenAddress, 
    createTransferInstruction,
    getMint
} from "@solana/spl-token";

export async function POST(req: Request) {
    try {
        const { from, to, amount, mint } = await req.json();

        // Validate required parameters
        if (!from || !to || !amount) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Create connection
        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);

        // Convert parameters to appropriate types
        const fromPubkey = new PublicKey(from);
        const toPubkey = new PublicKey(to);

        const transaction = new Transaction();

        if (!mint) {
            // Transfer native SOL
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: amount * LAMPORTS_PER_SOL
                })
            );
        } else {
            // Transfer SPL token
            const mintPubkey = new PublicKey(mint);
            const fromAta = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
            const toAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);
            
            // Get mint info to determine decimals
            const mintInfo = await getMint(connection, mintPubkey);
            const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);

            transaction.add(
                createTransferInstruction(
                    fromAta,
                    toAta,
                    fromPubkey,
                    adjustedAmount
                )
            );
        }

        // Get the latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        return NextResponse.json({ 
            transaction: transaction.serialize({ 
                requireAllSignatures: false,
                verifySignatures: false 
            }).toString('base64')
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
} 