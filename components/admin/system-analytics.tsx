'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  systemStatus: string;
  metrics: {
    transactionChange: string;
    activeUsersChange: string;
  };
}

export function SystemAnalytics() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    systemStatus: 'Healthy',
    metrics: {
      transactionChange: '0',
      activeUsersChange: '0',
    },
  });
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async (range: string) => {
    try {
      const { data } = await axios.get<SystemMetrics>(`/api/analytics?timeRange=${range}`);
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load system analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(timeRange);
  }, [timeRange]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={metrics.metrics.activeUsersChange.startsWith('-') ? 'text-red-500' : 'text-green-500'}>
                {metrics.metrics.activeUsersChange}%
              </span>
              <span>vs previous period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={metrics.metrics.transactionChange.startsWith('-') ? 'text-red-500' : 'text-green-500'}>
                {metrics.metrics.transactionChange}%
              </span>
              <span>vs previous period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.systemStatus}
            </div>
            <p className="text-xs text-muted-foreground">
              Current system health
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
