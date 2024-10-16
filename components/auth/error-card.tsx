import { Card, CardFooter, CardHeader } from "../ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";

const ErrorCard = () => {
  return (
    <Card>
      <CardHeader>
        <Header label="Oops! Une erreur inatendue est survenue" />
      </CardHeader>
      <CardFooter>
        <BackButton label="Retour à la page de connexion" href="/sign-in" />
      </CardFooter>
    </Card>
  );
};

export default ErrorCard;
