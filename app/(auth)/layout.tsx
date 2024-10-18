import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen y-8 flex items-center justify-center bg-gradient-to-tr from-slate-800 via-blue-950 to-slate-950">
      {children}
    </div>
  );
};

export default AuthLayout;
