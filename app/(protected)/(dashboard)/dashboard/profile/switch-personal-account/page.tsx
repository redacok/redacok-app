import { SwitchAccountForm } from "./_components/switch-account-form";

const page = () => {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-3xl font-semibold border-b w-full py-4">
        Compte personnel
      </h1>
      <SwitchAccountForm />
    </div>
  );
};

export default page;
