import { useEffect, useState } from "react";
import { getProfile } from "../services/auth.service";
import type { User } from "../types/auth.types";
import { getApiError } from "../api/api-error";
import { useAuth } from "../context/AuthContext";

const Profile = () => {

  const [userDetails, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();

        setUser(response.data);
      } catch (error) {
        const apiError = getApiError(error);

        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white px-6 py-4 shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold">Auth App</h1>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-6 text-2xl font-bold">My Profile</h2>

          {error && <p className="mb-4 text-red-600">{error}</p>}

          {userDetails && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>

                <p className="text-lg font-medium">{userDetails.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="text-lg font-medium">{userDetails.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">User ID</p>

                <p className="break-all text-sm">{userDetails.id}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
