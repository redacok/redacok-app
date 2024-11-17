import { PageHeader } from "@/components/page-header";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto space-y-4">
      <PageHeader
        title="Admin Dashboard"
        description="Bienvenu dans votre interface d'administration"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add your admin dashboard components here */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          {/* User management component content */}
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Analytics</h2>
          {/* Analytics component content */}
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          {/* Settings component content */}
        </div>
      </div>
    </div>
  );
}
