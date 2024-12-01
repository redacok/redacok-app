import { prisma } from "@/lib/prisma";
import { FeeRangesTable } from "./_components/fee-ranges-table";

export default async function TransactionFeesPage() {
  const feeRanges = await prisma.transactionFeeRange.findMany({
    orderBy: { minAmount: "asc" },
  });

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Transaction Fees Configuration</h1>
        <p className="text-muted-foreground">
          Manage transaction fee ranges and rates
        </p>
      </div>

      <FeeRangesTable initialFeeRanges={feeRanges} />
    </div>
  );
}
