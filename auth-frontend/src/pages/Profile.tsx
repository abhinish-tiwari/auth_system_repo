import { useEffect, useState } from "react";
import { getProfile } from "../services/auth.service";
import type { User } from "../types/auth.types";
import { getApiError } from "../api/api-error";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [userDetails, setUserDetails] = useState<User | null>(authUser);
  const [loading, setLoading] = useState(!authUser);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        setUserDetails(response.data.user);
      } catch (err) {
        const apiError = getApiError(err);
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loader message="Loading profile details..." fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl font-bold text-white shadow-inner">
                {userDetails?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{userDetails?.name}</h1>
                <p className="text-blue-100 text-sm">{userDetails?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Account Information
            </h2>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {userDetails && (
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-base font-medium text-gray-900">
                    {userDetails.name}
                  </dd>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Email Address
                  </dt>
                  <dd className="mt-1 text-base font-medium text-gray-900">
                    {userDetails.email}
                  </dd>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    User Identifier (ID)
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-gray-700 break-all">
                    {userDetails.id}
                  </dd>
                </div>

                {userDetails.createdAt && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Member Since
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-gray-700">
                      {new Date(userDetails.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Session Security
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Encrypted HTTP-Only Cookie Active
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
