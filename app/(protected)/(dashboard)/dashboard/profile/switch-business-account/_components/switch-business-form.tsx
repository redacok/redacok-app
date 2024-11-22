"use client";

import addDocumentStore from "@/store/add-document-store";

import SkeletonWrapper from "@/components/skeleton-wrapper";
import { Kyc, Organisation } from "@prisma/client";
import { useEffect, useState } from "react";
import { SwitchVerificationBtn } from "../../_components/switch-verification-btn";
import { kycSubmited } from "../../actions";
// import { KycPersonalFiles } from "./kyc-personal-files";
import { VerificationState } from "../../switch-personal-account/_components/verification-state";
import {
  getKycAction,
  getKycOrganisationAction,
} from "../../switch-personal-account/actions";
import { KycBusinessFiles } from "./kyc-business-files";
import { KycBusinessInfo } from "./kyc-business-info";

export const SwitchToBusinessForm = () => {
  const { addDocument } = addDocumentStore();
  const [kycAction, setKycAction] = useState<Kyc | null>(null);
  const [organisationInfo, setOrganisationInfo] = useState<Organisation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmited, setIsSubmited] = useState(false);

  useEffect(() => {
    const fetchKycAction = async () => {
      const action = await getKycAction("BUSINESS");
      if (action) {
        const orgInfo = await getKycOrganisationAction(action);
        if (orgInfo) {
          const fetchVerificationStatus = async () => {
            const submit = await kycSubmited(action, "business");
            setIsSubmited(submit);
          };
          fetchVerificationStatus();
        }
        setOrganisationInfo(orgInfo);
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
            <>{<KycBusinessFiles />}</>
          ) : (
            <>
              <KycBusinessInfo
                kyc={kycAction!}
                organisation={organisationInfo!}
              />
            </>
          )}
        </SkeletonWrapper>
      </div>
    </div>
  );
};
