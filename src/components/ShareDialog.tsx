"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, Shield, Pencil, Users } from "lucide-react";

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

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Share Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Add people form */}
          {isOwner && (
            <form onSubmit={handleShare} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add people</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50/50 placeholder:text-gray-400"
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
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50/50"
                >
                  <option value="edit">Edit</option>
                  <option value="view">View</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm active:scale-[0.97]"
                >
                  <UserPlus size={16} />
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-2 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>
              )}
            </form>
          )}

          {/* People with access */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              People with access
            </h3>
            {shares.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users size={20} className="text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">No one else has access</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {shares.map((share, i) => (
                  <li key={share.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${colors[i % colors.length]} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                        {getInitial(share.user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{share.user.name}</p>
                        <p className="text-xs text-gray-400">{share.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        share.permission === "edit"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {share.permission === "edit" ? <Pencil size={10} /> : <Shield size={10} />}
                        {share.permission === "edit" ? "Editor" : "Viewer"}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleRemove(share.user.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove access"
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
