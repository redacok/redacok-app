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

import { UserAvatar } from "@/components/user-avatar";
import bankStore from "@/store/bank-store";
import { download, generateCsv, mkConfig } from "export-to-csv";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircleIcon,
  Clock10Icon,
  DownloadIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import RowActions from "./row-actions";

interface TransactionTableProps {
  from: Date;
  to: Date;
  userId?: string;
  all?: boolean;
}

export type TransactionHistoryRow =
  NonNullable<getTransactionsHistoryResponseType>[number];
const emptyData: TransactionHistoryRow[] = [];

const ActionsCell = ({ row }: { row: any }) => {
  const { data: session } = useSession();
  if (session?.user?.role !== "ADMIN") return null;
  return <RowActions transaction={row.original} />;
};

export const columns: ColumnDef<TransactionHistoryRow>[] = [
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Utilisateur" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <UserAvatar
            name={row.getValue("username")}
            image={row.original.user.image}
          />
          <span>{row.getValue("username")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "direction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Direction" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const type = row.getValue("type") as
        | "DEPOSIT"
        | "WITHDRAWAL"
        | "TRANSFER";
      const description = row.getValue("description") as string;

      let direction: "income" | "outcome" = "income";

      if (type === "WITHDRAWAL") {
        direction = "outcome";
      } else if (type === "TRANSFER") {
        direction = amount < 0 ? "outcome" : "income";
      } else if (type === "DEPOSIT") {
        // Check if it's a special case like affiliate reward
        if (description.toLowerCase().includes("affiliate reward")) {
          direction = "income";
        } else {
          direction = "income";
        }
      }

      return (
        <div
          className={cn(
            "flex items-center gap-2 font-medium",
            direction === "income" ? "text-green-600" : "text-red-600"
          )}
        >
          {direction === "income" ? (
            <>
              <ArrowDownRight className="h-4 w-4" />
              Entrant
            </>
          ) : (
            <>
              <ArrowUpRight className="h-4 w-4" />
              Sortant
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "accountName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compte" />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <p className="capitalize flex justify-start rounded-md text-center p-2 font-medium bg-gray-400/5">
        {row.original.accountName}
      </p>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Montant" />
    ),
    cell: ({ row }) => {
      const amount = row.original.amount as number;
      return (
        <p
          className={cn(
            "capitalize rounded-md text-center p-2 font-medium flex justify-start",
            amount > 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {amount < 0 && "- "}
          {row.original.formattedAmount}
        </p>
      );
    },
  },
  {
    accessorKey: "fee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Frais" />
    ),
    cell: ({ row }) => {
      return (
        <p
          className={cn(
            "capitalize rounded-md text-center p-2 font-medium flex justify-end text-yellow-900"
          )}
        >
          {row.original.fee}
        </p>
      );
    },
  },
  // {
  //   accessorKey: "category",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Catégorie" />
  //   ),
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.original.category?.id);
  //   },
  //   cell: ({ row }) => (
  //     <div className="flex gap-2 capitalize">
  //       <div className="capitalize">{row.original.category?.name}</div>
  //     </div>
  //   ),
  // },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="capitalize flex justify-start">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <div
          className={cn(
            "flex items-center gap-2 font-medium",
            status === "COMPLETED" ? "text-green-600" : "text-yellow-600"
          )}
        >
          {status === "COMPLETED" ? (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              Validé
            </>
          ) : (
            <>
              <Clock10Icon className="h-4 w-4" />
              En attente
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      const formattedDate = date.toLocaleString("default", {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
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
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeMap = {
        DEPOSIT: "Dépôt",
        WITHDRAWAL: "Retrait",
        TRANSFER: "Transfert",
      };

      return (
        <div
          className={cn(
            "capitalize rounded-md text-center p-2",
            type === "DEPOSIT" && "bg-emerald-400/10 text-emerald-500",
            type === "WITHDRAWAL" && "bg-red-400/10 text-red-500",
            type === "TRANSFER" && "bg-yellow-400/10 text-yellow-500"
          )}
        >
          {typeMap[type as keyof typeof typeMap]}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const TransactionTable = ({ from, to, userId }: TransactionTableProps) => {
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

  const statusOptions = useMemo(() => {
    const categoriesMap = new Map();
    history.data?.forEach((transaction) => {
      categoriesMap.set(transaction.status, {
        value: transaction.status,
        label: `${transaction.status}`,
        // label: `${transaction.categoryIcon} ${transaction.category}`,
      });
    });
    const uniqueCategories = new Set(categoriesMap.values());
    return Array.from(uniqueCategories);
  }, [history.data]);

  const bankAccountsOptions = useMemo(() => {
    const bankAccountsMap = new Map();
    history.data?.forEach((transaction) => {
      bankAccountsMap.set(transaction.accountName, {
        value: transaction.accountName,
        label: `${transaction.accountName}`,
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
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              title="Statuts"
              column={table.getColumn("status")}
              options={statusOptions}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              title="Types de transaction"
              column={table.getColumn("type")}
              options={[
                { label: "Dépôt", value: "DEPOSIT" },
                { label: "Retrait", value: "WITHDRAWAL" },
                { label: "Transfert", value: "TRANSFER" },
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
                Date: new Date(row.original.date).toLocaleDateString(),
                Type: row.getValue("type"),
                Utilisateur: row.original.username,
                Direction: row.original.amount > 0 ? "Entrant" : "Sortant",
                Compte: row.getValue("accountName"),
                Description: row.getValue("description"),
                Montant: row.original.formattedAmount,
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
