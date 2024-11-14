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
      <div className="md:container mx-auto px-4 w-full border-b bg-card py-8">
        <p className="text-3xl font-bold">Profile</p>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-4 container mx-auto py-4 mb-6 md:mb-0">
        <div className="w-full md:w-1/2 p-2 space-y-7">
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
