"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MAX_DATE_RANGE_DAYS } from "@/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import TransactionTable from "./_components/transaction-table";
import { CreateTransactionDialog } from "./_components/create-transaction-dialog";

const TransactionsPage = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  return (
    <div className="container mx-auto space-y-4">
      <PageHeader
        title="Transactions"
        description="Retrouvez toutes vos transactions"
        block={
          <div className="flex flex-col gap-3">
            <CreateTransactionDialog />
            <DateRangePicker
              initialDateFrom={dateRange.from}
              initialDateTo={dateRange.to}
              showCompare={false}
              onUpdate={(values) => {
                const { from, to } = values.range;

                if (!from || !to) return;
                if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                  toast.error(
                    `L'intervalle sélectionné est trop grand, le maximum autorisé est de ${MAX_DATE_RANGE_DAYS} jours`
                  );
                  return;
                }

                setDateRange({ from, to });
              }}
            />
          </div>
        }
      />
      <div className="container border bg-card p-2 mb-4 rounded-xl flex flex-col gap-4">
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </div>
  );
};

export default TransactionsPage;
