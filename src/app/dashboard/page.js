"use client";

import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

export default function DashboardPage() {
  const router = useRouter();
  const cookies = useCookies();
  const { name, setName } = useUser();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userdata = cookies.get("userdata") ? JSON.parse(cookies.get("userdata")) : null;
    setData(userdata);

    // Trigger POST request to save user data in the database if not already present
    if (userdata) {
      checkAndAddUserToDatabase(userdata);
    }
  }, []);

  useEffect(() => {
    if (!name) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const checkAndAddUserToDatabase = async (userdata) => {
    try {
      const res = await fetch(`/api/users?email=${userdata.email}`);
      const json = await res.json();
      
      if (json.success && json.data.length === 0) {
        await addUserToDatabase(userdata);
      }
    } catch (error) {
      console.error("Error checking or adding user:", error);
    }
  };

  const addUserToDatabase = async (userdata) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userdata.email,
          name: userdata.name,
        }),
      });
  
      const json = await res.json();
      if (!json.success) {
        console.error("Failed to save user data:", json.error);
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const handleLogout = () => {
    cookies.set("userdata", "", {
      expires: new Date(0),
      path: "/",
    });

    setName(null);
    router.push("/"); // Redirect to home page after logout
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Hi, {data.name}! You are successfully logged in.
        </h2>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
      
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Registered Users</h3>
        <ul className="divide-y divide-gray-200">
          {users.map(user => (
            <li key={user._id} className="py-4">
              <p className="text-gray-800 font-medium">{user.name}</p>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
