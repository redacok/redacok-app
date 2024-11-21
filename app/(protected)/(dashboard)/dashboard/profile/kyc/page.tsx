"use client";

import { DocumentsForm } from "./_components/documents-form";
import { PersonalInfoForm } from "./_components/personal-info-form";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function KYCPage() {
  const [step, setStep] = useState<"personal" | "documents">("personal");
  const [kycId, setKycId] = useState<string>("");

  const handlePersonalInfoSuccess = (id: string) => {
    setKycId(id);
    setStep("documents");
  };

  const handleDocumentsSuccess = () => {
    // Redirect or show success message
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Vérification KYC</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "personal" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Informations Personnelles</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Étape 1/2</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <PersonalInfoForm onSuccess={handlePersonalInfoSuccess} />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep("personal")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
                <span className="text-sm text-muted-foreground">Étape 2/2</span>
              </div>
              <h2 className="text-xl font-semibold mb-6">Documents Requis</h2>
              <DocumentsForm kycId={kycId} onSuccess={handleDocumentsSuccess} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}