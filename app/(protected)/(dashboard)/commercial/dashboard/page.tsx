"use client";

import { PageHeader } from "@/components/page-header";

import { DateRangePicker } from "@/components/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import TransactionTable from "../../dashboard/transactions/_components/transaction-table";

export default function CommercialDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <div className="container mx-auto space-y-6">
      <PageHeader
        title="Commercial Dashboard"
        description="Bienvenu dans votre interface d'administration commerciale"
        block={
          <div className="flex flex-col gap-3">
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

      {/* Pending transactions Transactions */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Transactions Summary</h2>
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </div>
  );
}
