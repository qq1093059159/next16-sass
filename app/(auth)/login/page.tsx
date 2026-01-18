import React from "react";
import { signIn } from "@/auth";
const SignIn = () => {
  return (
    <div className="flex min-h-screen justify-between">
      <div className="bg-area bg-amber-500 flex-1 animated-gradient"></div>
      <div className="login-form bg-blue-500 flex-1 min-h-screen">
        <div className="flex justify-center items-center min-h-screen">
          <div className="card">
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button type="submit">Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
