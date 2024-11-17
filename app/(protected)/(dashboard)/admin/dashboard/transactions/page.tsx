"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { PageHeader } from "@/components/page-header";
import { MAX_DATE_RANGE_DAYS } from "@/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import TransactionTable from "../../../dashboard/transactions/_components/transaction-table";

const AllTransactions = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Transactions"
        description="Suivez toutes les transactions"
        block=<DateRangePicker
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
      />
      <div className="md:container px-4 flex flex-col gap-4 py-4">
        <TransactionTable from={dateRange.from} to={dateRange.to} all />
      </div>
    </div>
  );
};

export default AllTransactions;
