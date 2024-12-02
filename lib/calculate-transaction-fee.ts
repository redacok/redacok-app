"use server"

import { db } from "./db";

export type FeeStructure = {
  percentage: number;
  fixedAmount: number;
  minAmount: number;
  maxAmount: number;
};

export async function calculateTransactionFee(amount: number): Promise<{ fee: number; totalAmount: number }> {
  // Find the appropriate fee range for the amount
  const feeRange = await db.transactionFeeRange.findFirst({
    where: {
      AND: [
        { minAmount: { lte: amount } },
        {
          OR: [
            { maxAmount: 0 },
            { maxAmount: { gte: amount } }
          ]
        }
      ],
    },
  });

  if (!feeRange) {
    // If no fee range is found, return 0 or throw an error based on your business logic
    return { fee: 0, totalAmount: amount };
  }

  const feeStructure: FeeStructure = {
    percentage: feeRange.feePercentage,
    fixedAmount: feeRange.fixedFee,
    minAmount: feeRange.minFee,
    maxAmount: feeRange.maxFee,
  };

  return calculateTransactionFeeHelper(amount, feeStructure);
}

function calculateTransactionFeeHelper(
  amount: number,
  feeStructure: FeeStructure
): { fee: number; totalAmount: number } {
  const { percentage, fixedAmount, minAmount, maxAmount } = feeStructure;
  
  // Calculate percentage-based fee
  const percentageFee = (amount * percentage) / 100;
  
  // Add fixed amount
  let totalFee = percentageFee + fixedAmount;
  
  // Apply min/max constraints
  if (totalFee < minAmount) {
    totalFee = minAmount;
  } else if (maxAmount > 0 && totalFee > maxAmount) {
    totalFee = maxAmount;
  }
  
  return {
    fee: totalFee,
    totalAmount: amount + totalFee
  };
}
