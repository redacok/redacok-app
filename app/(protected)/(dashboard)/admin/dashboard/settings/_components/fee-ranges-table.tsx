"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { MoreHorizontal, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FeeRangeDialog } from "./fee-range-dialog";

interface FeeRange {
  id: string;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  fixedFee: number;
  minFee: number;
  maxFee: number;
  transactionType: string;
}

export function FeeRangesTable() {
  const [feeRanges, setFeeRanges] = useState<FeeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeeRange, setSelectedFeeRange] = useState<FeeRange | null>(
    null
  );

  const fetchFeeRanges = async () => {
    try {
      const response = await axios.get("/api/admin/fee-ranges");
      setFeeRanges(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Échec du chargement des intervalles de frais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeRanges();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
  };

  const handleEdit = (feeRange: FeeRange) => {
    setSelectedFeeRange(feeRange);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedFeeRange(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Intervalles de frais</h2>
          <Button onClick={() => setDialogOpen(true)}>
            Ajouter un intervalle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intervalle</TableHead>
                <TableHead>Pourcentage</TableHead>
                <TableHead>Frais fixe</TableHead>
                <TableHead>Frais minimum</TableHead>
                <TableHead>Frais maximum</TableHead>
                <TableHead>Type de transaction</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeRanges.map((range) => (
                <TableRow key={range.id}>
                  <TableCell>
                    {formatAmount(range.minAmount)} -{" "}
                    {formatAmount(range.maxAmount)}
                  </TableCell>
                  <TableCell>{range.feePercentage}%</TableCell>
                  <TableCell>{formatAmount(range.fixedFee)}</TableCell>
                  <TableCell>{formatAmount(range.minFee)}</TableCell>
                  <TableCell>{formatAmount(range.maxFee)}</TableCell>
                  <TableCell>{range.transactionType}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(range)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {feeRanges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Aucun intevalle de frais trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <FeeRangeDialog
          open={dialogOpen}
          onOpenChange={handleCloseDialog}
          onSuccess={() => {
            fetchFeeRanges();
            handleCloseDialog();
          }}
          feeRange={selectedFeeRange}
        />
      </CardContent>
    </Card>
  );
}
