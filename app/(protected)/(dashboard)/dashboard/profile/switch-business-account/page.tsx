"use client";

import { SwitchToBusinessForm } from "./_components/switch-business-form";

const page = () => {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-3xl font-semibold border-b w-full py-4">
        Compte business
      </h1>
      <SwitchToBusinessForm />
    </div>
  );
};

export default page;
