import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900">
      {children}
    </div>
  );
};

export default AuthLayout;
