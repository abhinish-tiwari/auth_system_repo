import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loader message="Loading profile..." fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl font-bold text-white shadow-inner">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <p className="text-blue-100 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Account Information
              </h2>
            </div>

            {user ? (
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-base font-medium text-gray-900">
                    {user.name}
                  </dd>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Email Address
                  </dt>
                  <dd className="mt-1 text-base font-medium text-gray-900">
                    {user.email}
                  </dd>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    User Identifier (ID)
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-gray-700 break-all">
                    {user.id}
                  </dd>
                </div>

                {user.createdAt && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Member Since
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Session Security
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Single Refresh Token Active
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No user profile data available.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
