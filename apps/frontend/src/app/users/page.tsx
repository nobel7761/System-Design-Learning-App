"use client";

import { useState } from "react";
import useAPI from "@/hooks/api/useAPI";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export default function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateUserDto>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [updateFormData, setUpdateFormData] = useState<UpdateUserDto>({});

  // 1. GET without lazy - automatically fetches on mount
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useAPI<User[]>({
    url: "/users",
  });

  // 2. GET with lazy - requires manual call
  const {
    data: singleUser,
    loading: singleUserLoading,
    loaded: singleUserLoaded,
    callApi: fetchUser,
  } = useAPI<User>({
    url: `/users/${selectedUserId}`,
    lazy: true,
  });

  // 3. POST - requires manual call
  const {
    data: createResult,
    loading: createLoading,
    error: createError,
    callApi: createUser,
  } = useAPI<User, CreateUserDto>({
    url: "/users",
    method: "POST",
  });

  // 4. PATCH - requires manual call
  const {
    data: updateResult,
    loading: updateLoading,
    error: updateError,
    callApi: updateUser,
  } = useAPI<User, UpdateUserDto>({
    url: `/users/${selectedUserId}`,
    method: "PATCH",
  });

  // 5. DELETE - requires manual call
  const {
    data: deleteResult,
    loading: deleteLoading,
    callApi: deleteUser,
  } = useAPI<{ message?: string; success?: boolean }>({
    url: `/users/${selectedUserId}`,
    method: "DELETE",
  });

  const handleCreateUser = async () => {
    await createUser(createFormData);
    setCreateFormData({ name: "", email: "", phone: "", address: "" });
    // Refetch users list after creation
    setTimeout(() => refetchUsers(), 500);
  };

  const handleUpdateUser = async () => {
    if (selectedUserId) {
      await updateUser(updateFormData);
      setUpdateFormData({});
      // Refetch users list after update
      setTimeout(() => refetchUsers(), 500);
    }
  };

  const handleDeleteUser = async () => {
    if (
      selectedUserId &&
      window.confirm("Are you sure you want to delete this user?")
    ) {
      await deleteUser();
      setSelectedUserId(null);
      // Refetch users list after deletion
      setTimeout(() => refetchUsers(), 500);
    }
  };

  const handleFetchUser = (userId: string) => {
    setSelectedUserId(userId);
    fetchUser();
  };

  return (
    <main className="container mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Users Management - useAPI Hook Examples
      </h1>

      {/* GET without lazy - Auto fetch */}
      <section className="mb-8 p-6 border border-gray-300 rounded-lg bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          1. GET without lazy (Auto-fetch on mount)
        </h2>
        {usersLoading && (
          <p className="text-blue-700 font-medium">Loading users...</p>
        )}
        {usersError && (
          <p className="text-red-700 font-medium">
            Error: {JSON.stringify(usersError)}
          </p>
        )}
        {users && (
          <div>
            <p className="text-green-700 mb-2 font-medium">
              ✓ Users loaded automatically
            </p>
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user._id}
                  className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-gray-900"
                  onClick={() => handleFetchUser(user._id)}
                >
                  <strong className="font-semibold">{user.name}</strong> -{" "}
                  <span className="text-gray-700">{user.email}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* GET with lazy - Manual fetch */}
      <section className="mb-8 p-6 border border-gray-300 rounded-lg bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          2. GET with lazy (Manual fetch)
        </h2>
        <div className="mb-4">
          <button
            onClick={() => selectedUserId && fetchUser()}
            disabled={!selectedUserId || singleUserLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {singleUserLoading ? "Loading..." : "Fetch Selected User"}
          </button>
        </div>
        {singleUserLoaded && singleUser && (
          <div className="p-4 bg-green-50 rounded">
            <p className="text-green-700 mb-2 font-medium">
              ✓ User fetched manually
            </p>
            <pre className="bg-white p-3 rounded text-sm overflow-auto text-gray-900 border border-gray-200">
              {JSON.stringify(singleUser, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* POST */}
      <section className="mb-8 p-6 border border-gray-300 rounded-lg bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          3. POST (Create User)
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={createFormData.name}
            onChange={(e) =>
              setCreateFormData({ ...createFormData, name: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={createFormData.email}
            onChange={(e) =>
              setCreateFormData({ ...createFormData, email: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Phone (optional)"
            value={createFormData.phone}
            onChange={(e) =>
              setCreateFormData({ ...createFormData, phone: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={createFormData.address}
            onChange={(e) =>
              setCreateFormData({ ...createFormData, address: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateUser}
            disabled={
              createLoading || !createFormData.name || !createFormData.email
            }
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            {createLoading ? "Creating..." : "Create User"}
          </button>
        </div>
        {createError && (
          <p className="text-red-700 mt-2 font-medium">
            Error: {JSON.stringify(createError)}
          </p>
        )}
        {createResult && (
          <p className="text-green-700 mt-2 font-medium">
            ✓ User created: {createResult.name} ({createResult.email})
          </p>
        )}
      </section>

      {/* PATCH */}
      <section className="mb-8 p-6 border border-gray-300 rounded-lg bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          4. PATCH (Update User)
        </h2>
        {selectedUserId && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name (optional)"
              value={updateFormData.name || ""}
              onChange={(e) =>
                setUpdateFormData({ ...updateFormData, name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={updateFormData.email || ""}
              onChange={(e) =>
                setUpdateFormData({ ...updateFormData, email: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUpdateUser}
              disabled={updateLoading || !selectedUserId}
              className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
            >
              {updateLoading ? "Updating..." : "Update User"}
            </button>
          </div>
        )}
        {!selectedUserId && (
          <p className="text-gray-600">
            Select a user from the list above to update
          </p>
        )}
        {updateError && (
          <p className="text-red-700 mt-2 font-medium">
            Error: {JSON.stringify(updateError)}
          </p>
        )}
        {updateResult && (
          <p className="text-green-700 mt-2 font-medium">
            ✓ User updated: {updateResult.name} ({updateResult.email})
          </p>
        )}
      </section>

      {/* DELETE */}
      <section className="mb-8 p-6 border border-gray-300 rounded-lg bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          5. DELETE (Delete User)
        </h2>
        {selectedUserId && (
          <button
            onClick={handleDeleteUser}
            disabled={deleteLoading || !selectedUserId}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            {deleteLoading ? "Deleting..." : "Delete Selected User"}
          </button>
        )}
        {!selectedUserId && (
          <p className="text-gray-600">
            Select a user from the list above to delete
          </p>
        )}
        {deleteResult ? (
          <p className="text-green-700 mt-2 font-medium">
            ✓ User deleted successfully
          </p>
        ) : null}
      </section>
    </main>
  );
}
