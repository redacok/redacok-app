"use client";

import { PieChart } from "@/components/charts/pie-chart";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateToUTCDate, getFormatterForCurrency } from "@/lib/helpers";
import { Transaction, TransactionStatus, TransactionType } from "@prisma/client";
import axios from "axios";
import { addDays } from "date-fns";
import { HelpCircle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageAmount: number;
  typeDistribution: {
    [key in TransactionType]: number;
  };
}

function StatCard({
  title,
  value,
  description,
  loading,
  tooltipText,
}: {
  title: string;
  value: string | number;
  description: string;
  loading: boolean;
  tooltipText: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function TransactionsSummary() {
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalVolume: 0,
    successRate: 0,
    averageAmount: 0,
    typeDistribution: {
      DEPOSIT: 0,
      WITHDRAWAL: 0,
      TRANSFER: 0,
    },
  });
  const [date, setDate] = useState<{
    from: Date;
    to: Date;
  }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: transactions } = await axios.get<Transaction[]>(
        `/api/transactions-history?from=${DateToUTCDate(
          date.from
        )}&to=${DateToUTCDate(
          date.to
        )}`
      );
  
      // Validate transactions data
      if (!Array.isArray(transactions)) {
        throw new Error("Invalid response format");
      }
  
      // Calculate total transactions
      const totalTransactions = transactions.length;
  
      // Calculate total volume with proper type checking
      const totalVolume = transactions.reduce((sum: number, t: Transaction) => {
        const amount = typeof t.amount === 'number' ? t.amount : 0;
        return sum + amount;
      }, 0);
  
      // Calculate completed transactions
      const completedTransactions = transactions.filter(
        (t: Transaction) => t.status === TransactionStatus.COMPLETED
      ).length;
  
      // Calculate success rate
      const successRate = totalTransactions > 0
        ? Math.round((completedTransactions / totalTransactions) * 100 * 100) / 100
        : 0;
  
      // Calculate average amount
      const averageAmount = totalTransactions > 0
        ? Math.round((totalVolume / totalTransactions) * 100) / 100
        : 0;
  
      // Calculate type distribution with validation
      const typeDistribution = transactions.reduce(
        (acc: { [key in TransactionType]: number }, t: Transaction) => {
          if (Object.values(TransactionType).includes(t.type)) {
            acc[t.type] = (acc[t.type] || 0) + 1;
          }
          return acc;
        },
        {
          DEPOSIT: 0,
          WITHDRAWAL: 0,
          TRANSFER: 0,
        }
      );
  
      setStats({
        totalTransactions,
        totalVolume,
        successRate,
        averageAmount,
        typeDistribution,
      });
    } catch (error) {
      console.error("Error fetching transaction statistics:", error);
      setError(error instanceof Error ? error.message : "Failed to load transaction statistics");
      toast.error("Failed to load transaction statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionStats();
  }, [date.from, date.to]);

  const formatter = getFormatterForCurrency("XAF");

  const chartData = Object.entries(stats.typeDistribution).map(
    ([type, count]) => ({
      name: type,
      value: count,
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DateRangePicker
          initialDateFrom={date.from}
          initialDateTo={date.to}
          onUpdate={({ range }) => {
            if (range.from && range.to) {
              setDate({ from: range.from, to: range.to });
            }
          }}
        />
        {error ? (
          <Button
            variant="outline"
            onClick={fetchTransactionStats}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        ) : <Button
        variant="outline"
        onClick={fetchTransactionStats}
        className="flex items-center gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button> 
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          description="In selected period"
          loading={isLoading}
          tooltipText="Total number of transactions processed during the selected time period"
        />

        <StatCard
          title="Total Volume"
          value={formatter.format(stats.totalVolume)}
          description="Transaction volume"
          loading={isLoading}
          tooltipText="Total monetary value of all transactions"
        />

        <StatCard
          title="Success Rate"
          value={`${stats.successRate.toFixed(1)}%`}
          description="Completed transactions"
          loading={isLoading}
          tooltipText="Percentage of transactions that were successfully completed"
        />

        <StatCard
          title="Average Amount"
          value={formatter.format(stats.averageAmount)}
          description="Per transaction"
          loading={isLoading}
          tooltipText="Average amount per transaction in the selected period"
        />
      </div>

      {!isLoading && !error && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Transaction Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <PieChart data={chartData} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
