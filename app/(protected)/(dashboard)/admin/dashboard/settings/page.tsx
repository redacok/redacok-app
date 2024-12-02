import { Metadata } from "next";
import { FeeRangesTable } from "./_components/fee-ranges-table";
import { SettingsTable } from "./_components/settings-table";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Settings | Admin",
  description: "Admin settings and configuration",
};

export default async function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Admin Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage transaction fees and other system settings
          </p>
        </div>
        <Separator />
        <div className="grid gap-6">
          <FeeRangesTable />
          <Separator />
          <SettingsTable />
        </div>
      </div>
    </div>
  );
}
