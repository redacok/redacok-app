"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TransactionFeeRange } from "@prisma/client";
import { useState } from "react";

interface EditFeeRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeRange: TransactionFeeRange | null;
  onSave: (range: TransactionFeeRange) => void;
}

export function EditFeeRangeDialog({
  open,
  onOpenChange,
  feeRange,
  onSave,
}: EditFeeRangeDialogProps) {
  const [formData, setFormData] = useState<Partial<TransactionFeeRange>>(
    feeRange || {
      minAmount: 0,
      maxAmount: 0,
      feePercentage: 0,
      fixedFee: 0,
      isActive: true,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/transaction-fees", {
        method: feeRange ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save fee range");

      const savedRange = await response.json();
      onSave(savedRange);
    } catch (error) {
      console.error("Error saving fee range:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {feeRange ? "Edit Fee Range" : "Add New Fee Range"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minAmount">Minimum Amount</Label>
            <Input
              id="minAmount"
              type="number"
              step="0.01"
              value={formData.minAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  minAmount: parseFloat(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Maximum Amount</Label>
            <Input
              id="maxAmount"
              type="number"
              step="0.01"
              value={formData.maxAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxAmount: parseFloat(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feePercentage">Fee Percentage</Label>
            <Input
              id="feePercentage"
              type="number"
              step="0.01"
              value={formData.feePercentage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  feePercentage: parseFloat(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixedFee">Fixed Fee</Label>
            <Input
              id="fixedFee"
              type="number"
              step="0.01"
              value={formData.fixedFee}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fixedFee: parseFloat(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
