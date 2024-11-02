import { CurrencyComboBox } from "@/components/currency-combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Profile = () => {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-3xl font-semibold border-b w-full py-4">Profile</h1>
      <div className="w-full flex md:gap-2 container mx-auto">
        <div className="w-full md:w-1/2 p-2">
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
        </div>
        <div className="w-full md:w-1/2"></div>
      </div>
    </div>
  );
};

export default Profile;
