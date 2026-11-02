"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  FileText,
  LogOut,
  Upload,
  Users,
  Clock,
  Trash2,
  Search,
  MoreVertical,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";

interface Document {
  id: string;
  title: string;
  updatedAt: string;
  owner: { name: string; email: string };
  shares?: { permission: string }[];
}

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [owned, setOwned] = useState<Document[]>([]);
  const [shared, setShared] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.ok) {
      const data = await res.json();
      setOwned(data.owned);
      setShared(data.shared);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") fetchDocs();
  }, [status, router, fetchDocs]);

  async function createDocument() {
    setCreating(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Document" }),
    });
    const doc = await res.json();
    setCreating(false);
    router.push(`/documents/${doc.id}`);
  }

  async function deleteDocument(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchDocs();
  }

  function formatDate(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
  }

  const filteredOwned = owned.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredShared = shared.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <FileText size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Ajaia Docs</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {getInitial(session?.user?.name || "U")}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{session?.user?.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {owned.length + shared.length} document{owned.length + shared.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 hover:border-gray-300"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={createDocument}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              <Plus size={16} />
              New Document
            </button>
          </div>
        </div>

        {/* Search */}
        {(owned.length > 0 || shared.length > 0) && (
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 text-sm"
            />
          </div>
        )}

        {showUpload && (
          <div className="mb-8">
            <FileUpload
              onUploadComplete={(docId) => {
                setShowUpload(false);
                router.push(`/documents/${docId}`);
              }}
            />
          </div>
        )}

        {owned.length === 0 && shared.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileText size={36} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No documents yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Create your first document or import an existing file to get started
            </p>
            <button
              onClick={createDocument}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all text-sm font-semibold shadow-lg shadow-blue-600/20"
            >
              <Plus size={16} />
              Create Document
            </button>
          </div>
        ) : (
          <>
            {filteredOwned.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={14} />
                  Owned by me
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium normal-case tracking-normal">
                    {filteredOwned.length}
                  </span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOwned.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/80 transition-all cursor-pointer group relative"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <FileText size={18} className="text-blue-500" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(deleteConfirm === doc.id ? null : doc.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {deleteConfirm === doc.id && (
                          <div
                            className="absolute right-4 top-14 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-1 min-w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 truncate mb-1">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>{formatDate(doc.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredShared.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users size={14} />
                  Shared with me
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium normal-case tracking-normal">
                    {filteredShared.length}
                  </span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredShared.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300/80 transition-all cursor-pointer group relative"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <FileText size={18} className="text-emerald-500" />
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-medium capitalize">
                          {doc.shares?.[0]?.permission || "edit"}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 truncate mb-1">
                        {doc.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={12} />
                          <span>{formatDate(doc.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-semibold text-gray-600">{getInitial(doc.owner.name)}</span>
                          </div>
                          <span className="text-xs text-gray-500">{doc.owner.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {search && filteredOwned.length === 0 && filteredShared.length === 0 && (
              <div className="text-center py-12">
                <Search size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No documents match &ldquo;{search}&rdquo;</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Click outside to close delete menu */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-0" onClick={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}
