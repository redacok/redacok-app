import { PageHeader } from "@/components/page-header";

import { TransactionsSummary } from "@/components/admin/transactions-summary";

export default function CommercialDashboard() {
  return (
    <div className="container mx-auto space-y-6">
      <PageHeader
        title="Commercial Dashboard"
        description="Bienvenu dans votre interface d'administration commerciale"
      />

      {/* Transactions Summary */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Transactions Summary</h2>
        <TransactionsSummary />
      </div>
    </div>
  );
}
