"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Trash2 } from "lucide-react";

interface Share {
  id: string;
  permission: string;
  user: { id: string; name: string; email: string };
}

interface ShareDialogProps {
  documentId: string;
  shares: Share[];
  isOwner: boolean;
  onClose: () => void;
  onShareUpdate: () => void;
}

export default function ShareDialog({
  documentId,
  shares,
  isOwner,
  onClose,
  onShareUpdate,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("edit");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, []);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, permission }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setEmail("");
    onShareUpdate();
  }

  async function handleRemove(userId: string) {
    await fetch(`/api/documents/${documentId}/share`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    onShareUpdate();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Share Document</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {isOwner && (
            <form onSubmit={handleShare} className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="user-emails"
                    required
                  />
                  <datalist id="user-emails">
                    {users.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name}
                      </option>
                    ))}
                  </datalist>
                </div>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="edit">Can edit</option>
                  <option value="view">Can view</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <UserPlus size={16} />
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">People with access</h3>
            {shares.length === 0 ? (
              <p className="text-gray-400 text-sm">No one else has access</p>
            ) : (
              <ul className="space-y-3">
                {shares.map((share) => (
                  <li key={share.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{share.user.name}</p>
                      <p className="text-xs text-gray-500">{share.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                        {share.permission}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleRemove(share.user.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
