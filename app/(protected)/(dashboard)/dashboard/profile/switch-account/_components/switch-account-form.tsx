"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import addDocumentStore from "@/store/add-document-store";
import { Pen } from "lucide-react";

import SkeletonWrapper from "@/components/skeleton-wrapper";
import { Kyc } from "@prisma/client";
import { useEffect, useState } from "react";
import { FcDocument } from "react-icons/fc";
import { getKycAction } from "../actions";
import { KycPersonalFiles } from "./kyc-personal-files";
import { KycPersonalInfo } from "./kyc-personal-info";

export const SwitchAccountForm = () => {
  const { addDocument, toggle } = addDocumentStore();
  const [kycAction, setKycAction] = useState<Kyc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKycAction = async () => {
      const action = await getKycAction();
      setKycAction(action);
      setIsLoading(false);
    };
    fetchKycAction();
  }, []);

  return (
    <div className="flex w-full container mx-auto flex-col md:flex-row gap-3 mt-2">
      <div className="w-full md:w-1/4 space-y-4">
        <Button
          className={cn(
            "w-full transition-all",
            addDocument && "bg-white text-slate-900 hover:text-white"
          )}
          onClick={() => addDocument && toggle()}
        >
          <Pen />
          Informations Personnelles
        </Button>
        <Button
          className={cn(
            "w-full transition-all",
            !addDocument && "bg-white text-slate-900 hover:text-white"
          )}
          onClick={() => !addDocument && toggle()}
        >
          <FcDocument />
          Fichiers d&apos;identification
        </Button>
      </div>
      <div className="max-w-[800px] w-full md:w-3/4 mx-auto mb-6 md:mb-0 pb-6">
        <SkeletonWrapper isLoading={isLoading}>
          {addDocument ? (
            <>
              <KycPersonalFiles kyc={kycAction!} />
            </>
          ) : (
            <>
              <KycPersonalInfo kyc={kycAction!} />
            </>
          )}
        </SkeletonWrapper>
      </div>
    </div>
  );
};
