import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/helpers"; 

interface AffiliateEarning {
  id: string;
  amount: number;
  createdAt: Date;
  affiliateRewardTransaction: {
    user: {
      name: string | null;
      email: string | null;
    };
  } | null;
}

interface EarningsTableProps {
  earnings: AffiliateEarning[];
  currency?: string;
}

export const EarningsTable = ({
  earnings,
  currency = "XAF",
}: EarningsTableProps) => {
  const totalEarnings = earnings.reduce(
    (sum, earning) => sum + earning.amount,
    0
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-primary/10 p-4">
        <p className="text-sm font-medium">Total Earnings</p>
        <p className="text-2xl font-bold">
          {formatCurrency(totalEarnings, currency)}
        </p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>From</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earnings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No earnings yet
                </TableCell>
              </TableRow>
            ) : (
              earnings.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell>
                    {formatDate(earning.createdAt, "fr-FR")}
                  </TableCell>
                  <TableCell>
                    {earning.affiliateRewardTransaction?.user.name ||
                      earning.affiliateRewardTransaction?.user.email ||
                      "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(earning.amount, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
