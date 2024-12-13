import { SignUpForm } from "@/components/auth/sign-up-form";
import { Suspense } from "react";

const SignUpPage = () => {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
};

export default SignUpPage;
