"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateReferralCode } from "../actions";

interface ReferralCardProps {
  referralCode: string;
  canEdit?: boolean;
}

const baseUrl = process.env.NEXT_APP_URL || "https://redacok.laclass.dev";

export const ReferralCard = ({
  referralCode,
  canEdit = false,
}: ReferralCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState(referralCode);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [referralLink, setReferralLink] = useState(
    `${baseUrl}/sign-up?ref=${referralCode}`
  );

  useEffect(() => {
    setReferralLink(`${baseUrl}/sign-up?ref=${newReferralCode}`);
  }, [newReferralCode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Lien copié !");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateReferralCode({
        referralCode: newReferralCode,
      });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      }
      if (result.success) {
        setSuccess(result.success);
        toast.success(result.success);
        setIsEditing(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Votre lien d&apos;affiliation
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">
                Votre nouveau code d&apos;affiliation
              </label>
              <CardDescription>
                Vous ne pourrez plus le modifier une fois que vous aurez des
                affiliés
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                value={newReferralCode}
                onChange={(e) => setNewReferralCode(e.target.value)}
                placeholder="Nouveau code de parrainage"
                disabled={isPending}
              />
              <Button
                type="submit"
                disabled={isPending || newReferralCode === referralCode}
              >
                {isPending ? "..." : "Enregistrer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewReferralCode(referralCode);
                }}
                disabled={isPending}
              >
                Annuler
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        ) : (
          <div className="space-y-2">
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
            {success && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-100 border-emerald-500 border text-emerald-700">
                <p>{success}</p>
                <X
                  className="bg-emerald-800 text-emerald-50 rounded-sm cursor-pointer"
                  onClick={() => setSuccess(undefined)}
                />
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Partagez votre lien d&apos;affiliation avec vos amis et gagnez 10% de
          leur premier dépot
        </p>
      </CardContent>
    </Card>
  );
};
