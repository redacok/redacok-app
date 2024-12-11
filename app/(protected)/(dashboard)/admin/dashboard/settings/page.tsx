import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import { FeeRangesTable } from "./_components/fee-ranges-table";
import { SettingsTable } from "./_components/settings-table";

export const metadata: Metadata = {
  title: "Settings | Admin",
  description: "Admin settings and configuration",
};

export default async function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <PageHeader
          title="Admin Settings"
          description="Gérer les frais de transaction et autres paramètres"
        />

        <div className="grid gap-6">
          <FeeRangesTable />
          <Separator />
          <SettingsTable />
        </div>
      </div>
    </div>
  );
}
