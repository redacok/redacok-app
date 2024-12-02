"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ReferralCardProps {
  referralCode: string;
}

const baseUrl = process.env.NEXT_APP_URL || "http://localhost:3000";

export const ReferralCard = ({ referralCode }: ReferralCardProps) => {
  const referralLink = `${baseUrl}/register?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Lien copié !");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre lien d&apos;affiliation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            readOnly
            value={referralLink}
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => copyToClipboard(referralLink)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Partagez votre lien d&apos;affiliation avec vos amis et gagnez 10% de leur premier dépot
        </p>
      </CardContent>
    </Card>
  );
};
