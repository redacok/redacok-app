import { auth } from "@/auth";
import { CurrencyComboBox } from "@/components/currency-combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { AccountType } from "./_components/account-type";
import { UpdateInfo } from "./_components/update-info";

const Profile = async () => {
  const session = await auth();
  if (!session) {
    redirect("/sign-in?callback=/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-3xl font-semibold border-b w-full py-4">Profile</h1>
      <div className="w-full flex flex-col md:flex-row md:gap-2 container mx-auto">
        <div className="w-full md:w-1/2 p-2 space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Devise</CardTitle>
              <CardDescription>
                Choisissez votre devise par défaut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrencyComboBox />
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Type de compte</CardTitle>
              <CardDescription>Changer de type de compte</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountType session={session.user} />
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-1/2 p-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Information du profile</CardTitle>
              <CardDescription>
                Vous pouvez modifier ces informations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateInfo session={session.user} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
