"use client";

import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInNumberForm } from "@/components/auth/sign-in-number-form";
import useNumberSignin from "@/store/sign-in-form-store";

const SignInPage = () => {
  const { isNumberSignin } = useNumberSignin();
  return <div>{isNumberSignin ? <SignInNumberForm /> : <SignInForm />}</div>;
};

export default SignInPage;
