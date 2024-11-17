import { auth } from "@/auth";
import { CurrencyComboBox } from "@/components/currency-combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { redirect } from "next/navigation";
import { AccountType } from "./_components/account-type";
import { UpdateInfo } from "./_components/update-info";

const Profile = async () => {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/sign-in?callback=/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col space-y-4 pb-10 md:pb-0">
      <div className="container mx-auto bg-card border rounded-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={session.user.name!} className="h-16 w-16" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {session.user.name}
              </h1>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-4 container mx-auto mb-6 md:mb-0">
        <div className="w-full md:w-1/2  space-y-7">
          {session.user.role !== "ADMIN" &&
            session.user.role !== "COMMERCIAL" && (
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
            )}
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
        <div className="w-full md:w-1/2">
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
