"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKYCStore } from "@/store/kyc-steps-store";
import { Kyc } from "@prisma/client";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getKycAction } from "../../switch-personal-account/actions";
import { BusinessDocumentsForm } from "./business-documents-form";
import { BusinessInfoForm } from "./business-info-form";
import { PersonalDocumentsForm } from "./personal-documents-form";

export default function DocumentsForm() {
  const [kycId, setKycId] = useState<string>("");
  const [Kyc, setKyc] = useState<Kyc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentStep, setStep } = useKYCStore();

  useEffect(() => {
    const fetchKycAction = async () => {
      const action = await getKycAction();

      setKyc(action);
      setKycId(action?.id ?? "");
      setIsLoading(false);
    };
    fetchKycAction();
  }, [kycId]);

  const handleBusinessInfoSuccess = (id: string) => {
    setKycId(id);
    setStep("documents");
  };

  const handleBusinessDocumentsSuccess = () => {
    // TODO: Show success message
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Vérification KYC</CardTitle>
        </CardHeader>
        <CardContent>
          {Kyc?.type === "PERSONAL" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  aria-label="retour"
                  onClick={() => setStep("personal")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">Retour</span>
                </Button>
                <span className="text-sm text-muted-foreground">Étape 2/2</span>
              </div>
              <h2 className="text-xl font-semibold mb-6">Documents Requis</h2>
              <PersonalDocumentsForm
                kycId={kycId}
                onSuccess={handleBusinessInfoSuccess}
              />
            </div>
          ) : currentStep === "infos" ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => setStep("personal")}
                  aria-label="retour"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">Retour</span>
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Étape 2/3
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setStep("documents")}
                    className="flex items-center gap-2"
                    aria-label="suivant"
                  >
                    <span className="sr-only">Suivant</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <BusinessInfoForm
                kycId={kycId}
                onSuccess={handleBusinessInfoSuccess}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep("infos")}
                  className="flex items-center gap-2"
                  aria-label="retour"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="sr-only">Retour</span>
                </Button>
                <span className="text-sm text-muted-foreground">Étape 2/3</span>
              </div>
              <h2 className="text-xl font-semibold mb-6">Documents Requis</h2>
              <BusinessDocumentsForm
                kycId={kycId}
                onSuccess={handleBusinessDocumentsSuccess}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
