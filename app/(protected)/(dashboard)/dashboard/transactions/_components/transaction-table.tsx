/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTransactionsHistoryResponseType } from "@/app/api/transactions-history/route";
import { DataTableColumnHeader } from "@/components/datatable/column-header";
import { DataTableViewOptions } from "@/components/datatable/column-toggle";
import { DataTableFacetedFilter } from "@/components/datatable/faceted-filters";
import SkeletonWrapper from "@/components/skeleton-wrapper";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DateToUTCDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { download, generateCsv, mkConfig } from "export-to-csv";
import { DownloadIcon } from "lucide-react";
import RowActions from "./row-actions";
import bankStore from "@/store/bank-store";

interface TransactionTableProps {
  from: Date;
  to: Date;
  userId?: string;
  all?: boolean;
}

export type TransactionHistoryRow = NonNullable<getTransactionsHistoryResponseType>[number];
const emptyData: TransactionHistoryRow[] = [];

export const columns: ColumnDef<TransactionHistoryRow>[] = [
  {
    accessorKey: "accountName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compte" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.bankAccount?.name);
    },
    cell: ({ row }) => (
      <p className="capitalize rounded-md text-center p-2 font-medium bg-gray-400/5">
        {row.original.bankAccount?.name}
      </p>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant" />
    ),
    cell: ({ row }) => (
      <p className="capitalize rounded-md text-center p-2 font-medium bg-gray-400/5">
        {row.original.formattedAmount}
      </p>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Catégorie" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.category?.id);
    },
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize">
        <div className="capitalize">{row.original.category?.name}</div>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.description}</div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      const formattedDate = date.toLocaleDateString("default", {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
      return <div className="text-muted-foreground"> {formattedDate} </div>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <div
        className={cn(
          "capitalize rounded-md text-center p-2",
          row.original.type !== "TRANSFER" &&
            "bg-emerald-400/10 text-emerald-500",
          row.original.type === "TRANSFER" && "bg-red-400/20 text-red-500"
        )}
      >
        {row.original.type === "DEPOSIT" ? "Dépot" : row.original.type === "WITHDRAWAL" ? "Retrait" : "Transfert"}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <RowActions transaction={row.original} />,
  },
];

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const TransactionTable = ({ from, to, userId, all }: TransactionTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const lastUpdate = bankStore((state) => state.lastUpdate);
  let fetchUrl: string = `/api/transactions-history?from=${DateToUTCDate(
    from
  )}&to=${DateToUTCDate(to)}`;

  if (userId) {
    fetchUrl = `/api/transactions-history/${userId}?from=${DateToUTCDate(
      from
    )}&to=${DateToUTCDate(to)}`;
  }

  if (all) {
    fetchUrl = `/api/transactions-history?from=${DateToUTCDate(
      from
    )}&to=${DateToUTCDate(to)}&size=all`;
  }

  const history = useQuery<getTransactionsHistoryResponseType>({
    queryKey: ["transactions", "history", from, to, lastUpdate],
    queryFn: () => fetch(fetchUrl).then((res) => res.json()),
  });

  const handleExportCsv = (data: any[]) => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useReactTable({
    data: history.data || emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const categoriesOptions = useMemo(() => {
    const categoriesMap = new Map();
    history.data?.forEach((transaction) => {
      categoriesMap.set(transaction.category?.id, {
        value: transaction.category?.id,
        label: `${transaction.category?.name}`,
        // label: `${transaction.categoryIcon} ${transaction.category}`,
      });
    });
    const uniqueCategories = new Set(categoriesMap.values());
    return Array.from(uniqueCategories);
  }, [history.data]);

  const bankAccountsOptions = useMemo(() => {
    const bankAccountsMap = new Map();
    history.data?.forEach((transaction) => {
      bankAccountsMap.set(transaction.bankAccount?.id, {
        value: transaction.bankAccount?.id,
        label: `${transaction.bankAccount?.name}`,
        // label: `${transaction.categoryIcon} ${transaction.category}`,
      });
    });
    const uniqueBankAccounts = new Set(bankAccountsMap.values());
    return Array.from(uniqueBankAccounts);
  }, [history.data]);

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-end justify-between gap-2 py-4">
        <div className="flex flex-auto flex-wrap md:flex-nowrap gap-2">
          {table.getColumn("accountName") && (
            <DataTableFacetedFilter
              title="Compte bancaire"
              column={table.getColumn("accountName")}
              options={bankAccountsOptions}
            />
          )}
          {table.getColumn("category") && (
            <DataTableFacetedFilter
              title="Catégories"
              column={table.getColumn("category")}
              options={categoriesOptions}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              title="Types de transaction"
              column={table.getColumn("type")}
              options={[
                { label: "Entrées", value: "income" },
                { label: "Sorties", value: "Dépense" },
              ]}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={"outline"}
            size={"sm"}
            className="ml-auto h-8 lg:flex"
            onClick={() => {
              const data = table.getFilteredRowModel().rows.map((row) => ({
                Catégorie: row.original.category,
                // Icone: row.original.category.icon,
                Description: row.original.description,
                Type: row.original.type,
                Montant: row.original.amount,
                "Montant formaté": row.original.formattedAmount,
                Date: row.original.createdAt,
              }));
              handleExportCsv(data);
            }}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Exporter (CSV)
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <SkeletonWrapper isLoading={history.isFetching}>
        {history.isError ? (
          <div className="text-center p-4 text-red-500">
            Une erreur est survenue lors du chargement des transactions
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="text-center">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="text-center">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Aucune transaction trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </Button>
            </div>
          </>
        )}
      </SkeletonWrapper>
    </div>
  );
};

export default TransactionTable;
