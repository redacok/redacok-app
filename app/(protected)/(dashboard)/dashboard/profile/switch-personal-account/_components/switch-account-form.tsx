"use client";

import addDocumentStore from "@/store/add-document-store";

import SkeletonWrapper from "@/components/skeleton-wrapper";
import { Kyc } from "@prisma/client";
import { useEffect, useState } from "react";
import { SwitchVerificationBtn } from "../../_components/switch-verification-btn";
import { kycSubmited } from "../../actions";
import { getKycAction } from "../actions";
import { KycPersonalFiles } from "./kyc-personal-files";
import { KycPersonalInfo } from "./kyc-personal-info";
import { VerificationState } from "./verification-state";

export const SwitchAccountForm = () => {
  const { addDocument } = addDocumentStore();
  const [kycAction, setKycAction] = useState<Kyc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmited, setIsSubmited] = useState(false);

  useEffect(() => {
    const fetchKycAction = async () => {
      const action = await getKycAction();
      if (action) {
        const fetchVerificationStatus = async () => {
          const submit = await kycSubmited(action);
          setIsSubmited(submit);
        };
        fetchVerificationStatus();
      }
      setKycAction(action);
      setIsLoading(false);
    };
    fetchKycAction();
  }, []);

  return isSubmited ? (
    <VerificationState />
  ) : (
    <div className="flex w-full container mx-auto flex-col md:flex-row gap-3 mt-2">
      <SwitchVerificationBtn />
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
