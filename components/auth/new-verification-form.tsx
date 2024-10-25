"use client";

import { newVerification } from "@/app/(auth)/auth/new-verification/actions";
import { LoaderPinwheelIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { CardWrapper } from "./card-wrapper";

function VerificationForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Token absent !");
      return;
    }
    newVerification(token)
      .then((data) => {
        setError(data.error);
        setSuccess(data.success);
      })
      .catch(() => {
        setError("Une erreur inatendue s'est produite !");
      });
  }, [token, error, success]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Vérification en cours"
      backButtonHref="/sign-in"
      BackButtonLabel="Revenir a la page de connexion"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && (
          <LoaderPinwheelIcon className="size-10 animate-spin" />
        )}
        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
}

export const NewVErificationForm = () => {
  return <VerificationForm />;
};
