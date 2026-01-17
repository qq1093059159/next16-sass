import React from "react";
import { signOut } from "@/auth";
const SignUp = () => {
  return (
    <div>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
};

export default SignUp;
