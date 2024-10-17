// pages/sign-in.js
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div
      className=" bg-background
    "
    >
      <SignIn />;
    </div>
  );
};

export default SignInPage;
