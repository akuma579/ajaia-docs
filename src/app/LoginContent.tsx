"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  function quickLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Ajaia Docs</h1>
              <p className="text-blue-600 font-medium">Collaborative editing</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">01</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rich Text Editing</h3>
                <p className="text-gray-500 text-sm mt-1">Bold, italic, headings, lists — everything you need with auto-save</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-sm">02</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Share & Collaborate</h3>
                <p className="text-gray-500 text-sm mt-1">Invite others with edit or view permissions on any document</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-violet-600 font-bold text-sm">03</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Import Files</h3>
                <p className="text-gray-500 text-sm mt-1">Drag and drop .txt or .md files to import existing content</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText size={22} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ajaia Docs</h1>
            </div>
            <p className="text-gray-500">Collaborative document editor</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all placeholder:text-gray-400 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick demo login</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Alice", email: "alice@example.com", color: "bg-blue-500" },
                { name: "Bob", email: "bob@example.com", color: "bg-emerald-500" },
                { name: "Charlie", email: "charlie@example.com", color: "bg-violet-500" },
              ].map((user) => (
                <button
                  key={user.email}
                  onClick={() => quickLogin(user.email)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className={`w-9 h-9 ${user.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    {user.name[0]}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{user.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Password: <span className="font-mono text-gray-500">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
