"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import addDocumentStore from "@/store/add-document-store";
import { Pen } from "lucide-react";
import { FcDocument } from "react-icons/fc";

export const SwitchVerificationBtn = () => {
  const { addDocument, toggle } = addDocumentStore();

  return (
    <div className="w-full md:w-1/4 space-y-4">
      <h1 className="font-semibold text-2xl">Vérification intermédiaire</h1>
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
  );
};
