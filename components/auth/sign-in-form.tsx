import { CardWrapper } from "./card-wrapper";

export const SignInForm = () => {
  return (
    <CardWrapper
      headerLabel="Ravi de vous revoir"
      BackButtonLabel="Vous n'avez pas de compte ?"
      backButtonHref="/sign-up"
      showSocial
    >
      login-form
    </CardWrapper>
  );
};
