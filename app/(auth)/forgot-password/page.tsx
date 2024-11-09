"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ForgotPasswordPhoneForm } from "@/components/auth/forgot-password-phone-form";
import useNumberSignin from "@/store/sign-in-form-store";

const ForgotPasswordPage = () => {
  const { isNumberSignin } = useNumberSignin();
  return (
    <div>
      {isNumberSignin ? <ForgotPasswordPhoneForm /> : <ForgotPasswordForm />}
    </div>
  );
};

export default ForgotPasswordPage;
