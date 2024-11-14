"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import TransactionTable from "./_components/transaction-table";

const Transactions = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  return (
    <div className="container mx-auto">
      <div className="border-b bg-card">
        <div className="md:container mx-auto px-4 flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Transaction</p>
            <p className="text-muted-foreground">
              Retrouvez toutes vos transactions
            </p>
          </div>
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
      </div>
      <div className="md:container px-4 flex flex-col gap-4 py-4">
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </div>
  );
};

export default Transactions;
