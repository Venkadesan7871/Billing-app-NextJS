'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import  {Login} from "./components/login";
import Register from "./components/Register";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    // JWT cookie is checked by middleware on /content
  }, [router]);

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSuccess = () => {
    router.push("/content");
  };

  return (
    <div className="its-body">
      {isLogin ? (
        <Login onToggle={handleToggle} onSuccess={handleLoginSuccess} />
      ) : (
        <Register onToggle={handleToggle} />
      )}
    </div>
  );
}
