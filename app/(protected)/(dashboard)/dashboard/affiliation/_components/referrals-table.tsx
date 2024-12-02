import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/helpers";
import { CheckCircle2, XCircle } from "lucide-react";

interface Referral {
  id: string;
  name: string | null;
  email: string | null;
  hasFirstDeposit: boolean;
  createdAt: Date;
}

interface ReferralsTableProps {
  referrals: Referral[];
}

export const ReferralsTable = ({ referrals }: ReferralsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>First Deposit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No referrals yet
              </TableCell>
            </TableRow>
          ) : (
            referrals.map((referral) => (
              <TableRow key={referral.id}>
                <TableCell>{referral.name || "N/A"}</TableCell>
                <TableCell>{referral.email || "N/A"}</TableCell>
                <TableCell>{formatDate(referral.createdAt, "fr-FR")}</TableCell>
                <TableCell>
                  {referral.hasFirstDeposit ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
