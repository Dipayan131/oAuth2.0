"use client";

import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "./context/UserContext";

export default function LoginPage() {
  const router = useRouter(); 
  const cookies = useCookies();
  const { name, setName } = useUser();

  useEffect(() => {
    // Retrieve userdata from cookies only when the component mounts
    const userdata = cookies.get("userdata") ? JSON.parse(cookies.get("userdata")) : null;

    // If userdata is present and name is not set, set the name
    if (userdata && !name) {
      setName(userdata.name);
      console.log("User Data:", userdata);
    }
  }, [cookies, name]); // Include dependencies for better practice

  useEffect(() => {
    if (name) {
      // If user data is available, redirect to the dashboard
      router.push("/dashboard");
    }
  }, [name]); // Include router in dependencies

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Login/Signup</h2>
        <div className="space-y-4">
          <button
            className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 w-full"
            onClick={() => router.push("/api/auth/github")}
          >
            Sign in with GitHub
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full"
            onClick={() => router.push("/api/auth/google")}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
