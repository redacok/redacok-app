"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKYCStore } from "@/store/kyc-steps-store";
import { Kyc } from "@prisma/client";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getKycAction } from "../switch-personal-account/actions";
import DocumentsForm from "./_components/documents-form";
import { PersonalInfoForm } from "./_components/personal-info-form";
// import { toast } from "sonner";

export default function KYCPage() {
  const { currentStep, setStep } = useKYCStore();
  const [kycId, setKycId] = useState<string>("");
  const [Kyc, setKyc] = useState<Kyc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKycAction = async () => {
      const action = await getKycAction();

      setKyc(action);
      setKycId(action?.id ?? "");
      setIsLoading(false);
    };
    fetchKycAction();
  }, [kycId]);

  const handlePersonalInfoSuccess = (id: string) => {
    setKycId(id);
    setStep("documents");
  };

  //  const handleDocumentsSuccess = () => {
  //    toast.success("Vérification KYC terminée avec succès!");
  //   //  router.push("/dashboard");
  //  };

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
    <div className="container mx-auto pb-10 space-y-4">
      <PageHeader
        title="Vérification Intermédiaire"
        description="Vérifiez votre identité"
      />
      {currentStep === "personal" ? (
        <Card>
          <CardHeader>
            <CardTitle>Vérification KYC</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Informations Personnelles
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Étape 1/2
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setStep("infos")}
                    className="flex items-center gap-2"
                    aria-label="suivant"
                  >
                    <span className="sr-only">Suivant</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <PersonalInfoForm
                Kyc={Kyc}
                onSuccess={handlePersonalInfoSuccess}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <DocumentsForm />
      )}
    </div>
  );
}
