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

  async function deleteDocument(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    fetchDocs();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={24} className="text-blue-600" />
            <h1 className="text-xl font-bold">Ajaia Docs</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload size={18} />
              Import File
            </button>
            <button
              onClick={createDocument}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus size={18} />
              New Document
            </button>
          </div>
        </div>

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
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No documents yet</p>
            <p className="text-gray-400 text-sm">
              Create a new document or import a file to get started
            </p>
          </div>
        ) : (
          <>
            {owned.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1">
                  <FileText size={14} />
                  Owned by me ({owned.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {owned.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 truncate flex-1">
                          {doc.title}
                        </h4>
                        <button
                          onClick={(e) => deleteDocument(doc.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>{formatDate(doc.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shared.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1">
                  <Users size={14} />
                  Shared with me ({shared.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {shared.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-400"
                    >
                      <h4 className="font-medium text-gray-900 truncate">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        by {doc.owner.name}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={12} />
                          <span>{formatDate(doc.updatedAt)}</span>
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded capitalize">
                          {doc.shares?.[0]?.permission || "edit"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
