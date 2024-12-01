import { prisma } from "./prisma";

export async function calculateTransactionFee(amount: number): Promise<number> {
  // Find the appropriate fee range for the amount
  const feeRange = await prisma.transactionFeeRange.findFirst({
    where: {
      AND: [
        { minAmount: { lte: amount } },
        { maxAmount: { gte: amount } },
        { isActive: true },
      ],
    },
  });

  if (!feeRange) {
    // If no fee range is found, return 0 or throw an error based on your business logic
    return 0;
  }

  // Calculate fee based on percentage and fixed fee
  const percentageFee = (amount * feeRange.feePercentage) / 100;
  const totalFee = percentageFee + feeRange.fixedFee;

  return totalFee;
}
