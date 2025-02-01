'use client'; // Marca el componente como un Client Component

import { useState } from "react";
import AuthForm from "./auth/sign-in/login";
import RegisterForm from "./auth/sing-up/register";

export default function Home(): JSX.Element {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div>
      <button onClick={toggleForm}>
        {isLogin ? "Go to Register" : "Go to Login"}
      </button>

      {isLogin ? <AuthForm /> : <RegisterForm />}
    </div>
  );
}
