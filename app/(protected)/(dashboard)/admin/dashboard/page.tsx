import { PageHeader } from "@/components/page-header";

// You'll need to create these components in separate files
import { KycRequestsTable } from "@/components/admin/kyc-requests-table";
import { TransactionsSummary } from "@/components/admin/transactions-summary";
import { UserManagement } from "@/components/admin/user-management";
import { SystemAnalytics } from "@/components/admin/system-analytics";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Bienvenu dans votre interface d'administration"
      />
      
      {/* KYC Requests Section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">KYC Requests</h2>
        <KycRequestsTable />
      </div>

      {/* Transactions Summary */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Transactions Summary</h2>
        <TransactionsSummary />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <UserManagement />
        </div>

        {/* System Analytics */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Analytics</h2>
          <SystemAnalytics />
        </div>
      </div>
    </div>
  );
}