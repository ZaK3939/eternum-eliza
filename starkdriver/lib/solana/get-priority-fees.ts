import { Connection, ComputeBudgetProgram, TransactionInstruction } from "@solana/web3.js";

export async function getPriorityFees(connection: Connection): Promise<{
    min: number;
    median: number;
    max: number;
    instructions?: {
      low: TransactionInstruction;
      medium: TransactionInstruction;
      high: TransactionInstruction;
    };
  }> {
    try {
      // Get recent prioritization fees
      const priorityFees = await connection.getRecentPrioritizationFees();
  
      if (!priorityFees.length) {
        return {
          min: 0,
          median: 0,
          max: 0,
        };
      }
  
      // Sort fees by value
      const sortedFees = priorityFees
        .map((x) => x.prioritizationFee)
        .sort((a, b) => a - b);
  
      // Calculate statistics
      const min = sortedFees[0] ?? 0;
      const max = sortedFees[sortedFees.length - 1] ?? 0;
      const mid = Math.floor(sortedFees.length / 2);
      const median =
        sortedFees.length % 2 === 0
          ? ((sortedFees[mid - 1] ?? 0) + (sortedFees[mid] ?? 0)) / 2
          : sortedFees[mid] ?? 0;
  
      // Helper to create priority fee IX based on chosen strategy
      const createPriorityFeeIx = (fee: number) => {
        return ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: fee,
        });
      };
  
      return {
        min,
        median,
        max,
        // Return instructions for different fee levels
        instructions: {
          low: createPriorityFeeIx(min),
          medium: createPriorityFeeIx(median),
          high: createPriorityFeeIx(max),
        },
      };
    } catch (error) {
      console.error("Error getting priority fees:", error);
      throw error;
    }
  }