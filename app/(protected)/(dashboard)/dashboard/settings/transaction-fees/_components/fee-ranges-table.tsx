"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionFeeRange } from "@prisma/client";
import { useState } from "react";
import { EditFeeRangeDialog } from "./edit-fee-range-dialog";

interface FeeRangesTableProps {
  initialFeeRanges: TransactionFeeRange[];
}

export function FeeRangesTable({ initialFeeRanges }: FeeRangesTableProps) {
  const [feeRanges, setFeeRanges] = useState(initialFeeRanges);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] =
    useState<TransactionFeeRange | null>(null);

  const handleEdit = (range: TransactionFeeRange) => {
    setSelectedRange(range);
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedRange(null);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transaction Fee Ranges</h2>
        <Button onClick={handleAdd}>Add New Range</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Min Amount</TableHead>
            <TableHead>Max Amount</TableHead>
            <TableHead>Fee Percentage</TableHead>
            <TableHead>Fixed Fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feeRanges.map((range) => (
            <TableRow key={range.id}>
              <TableCell>{range.minAmount}</TableCell>
              <TableCell>{range.maxAmount}</TableCell>
              <TableCell>{range.feePercentage}%</TableCell>
              <TableCell>{range.fixedFee}</TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => handleEdit(range)}>
                  Modifier
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditFeeRangeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        feeRange={selectedRange}
        onSave={(updatedRange) => {
          setFeeRanges((prev) => {
            if (selectedRange) {
              return prev.map((r) =>
                r.id === updatedRange.id ? updatedRange : r
              );
            }
            return [...prev, updatedRange];
          });
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
}
