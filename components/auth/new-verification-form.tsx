"use client";

import { LoaderPinwheelIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { CardWrapper } from "./card-wrapper";

export const NewVErificationForm = () => {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    console.log(token);
  }, [token]);

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
        <LoaderPinwheelIcon className="size-10 animate-spin" />
      </div>
    </CardWrapper>
  );
};
