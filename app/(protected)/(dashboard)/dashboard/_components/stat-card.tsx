"use client";

import { Card } from "@/components/ui/card";
import { getFormatterForCurrency } from "@/lib/helpers";
import { useCallback } from "react";
import CountUp from "react-countup";

export function StatCard({
  value,
  title,
  icon,
}: {
  value: number;
  icon: React.ReactNode;
  title: string;
}) {
  const formater = getFormatterForCurrency("XAF");

  const formatFn = useCallback(
    (value: number) => {
      return formater.format(value);
    },
    [formater]
  );
  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      {icon}
      <div className="flex flex-col gap-0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-xl lg:text-2xl"
        />
      </div>
    </Card>
  );
}
