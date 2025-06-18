"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      const redirectPath =
        data.user.role === "admin" ? "/admin/dashboard" : "/dashboard";

      router.push(redirectPath);

      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Floating particles */}
        <div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#048CE7]/60 rounded-full animate-ping"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#90caf9]/70 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[#8f93a9]/80 rounded-full animate-ping"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-1 h-1 bg-[#048CE7]/60 rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        />

        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#048CE7]/30 via-[#90caf9]/25 to-[#8f93a9]/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tl from-[#8f93a9]/25 via-[#90caf9]/20 to-[#048CE7]/25 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-[#048CE7]/20 to-[#90caf9]/15 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="w-full max-w-md px-4">
        {/* Enhanced Logo and Header */}
        <div className="text-center mb-10 select-none">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-bounce hover:animate-pulse cursor-pointer transform hover:scale-110 transition-all duration-300">
            <svg
              className="w-10 h-10 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] bg-clip-text text-transparent mb-3 tracking-tight drop-shadow-sm animate-pulse">
            AI Resume Analyzer
          </h1>
          <p className="text-gray-300 text-lg font-medium animate-fade-in">
            Welcome back! Sign in to continue
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div
              className="w-2 h-2 bg-[#048CE7] rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#90caf9] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-[#8f93a9] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* Enhanced Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden hover:shadow-[#048CE7]/25 transition-all duration-500">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm animate-shake">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-3 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Enhanced Email Field */}
              <div className="relative group">
                <div className="absolute -top-3 left-4 z-10">
                  <div className="bg-gradient-to-r from-[#048CE7] to-[#90caf9] p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-16 pr-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70 focus:bg-gray-700/80"
                    placeholder="Enter your email"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#048CE7]/10 to-[#90caf9]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="relative group">
                <div className="absolute -top-3 left-4 z-10">
                  <div className="bg-gradient-to-r from-[#90caf9] to-[#8f93a9] p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-16 pr-4 py-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#90caf9] focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70 focus:bg-gray-700/80"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#90caf9]/10 to-[#8f93a9]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] py-4 text-lg font-bold text-white rounded-2xl shadow-2xl hover:shadow-[#048CE7]/50 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#048CE7]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0378c7] via-[#7bb3e6] to-[#7a7f95] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg
                        className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Additional Features */}
            <div className="mt-8 pt-6 border-t border-gray-600/30">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-2 hover:text-[#90caf9] transition-colors duration-300 cursor-pointer">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Help</span>
                </div>
                <div className="w-px h-4 bg-gray-600/50"></div>
                <div className="flex items-center space-x-2 hover:text-[#90caf9] transition-colors duration-300 cursor-pointer">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Contact</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm font-medium select-none">
            &copy; {new Date().getFullYear()} AI Resume Analyzer
          </p>
          <p className="text-gray-500 text-xs mt-1 select-none">
            Powered by advanced AI technology
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
