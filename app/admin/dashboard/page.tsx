"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface DashboardStats {
  totalUsers: number;
  totalTags: number;
  totalExtractionFields: number;
  totalStoredFaces?: number;
}

interface TestResult {
  fileName: string;
  result: any;
  timestamp: string;
}

interface ApplicationCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "active" | "inactive" | "maintenance";
  stats?: {
    label: string;
    value: string | number;
    change?: string;
  }[];
  actions?: {
    label: string;
    href: string;
    variant: "primary" | "secondary" | "outline";
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTags: 0,
    totalExtractionFields: 0,
    totalStoredFaces: 0,
  });
  const [file, setFile] = useState<File | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Application cards configuration
  const applicationCards: ApplicationCard[] = [
    {
      id: "resume-analyzer",
      title: "AI Resume Analyzer",
      description:
        "Intelligent resume parsing and analysis with AI-powered insights",
      icon: "📄",
      status: "active",
      stats: [
        { label: "Total Users", value: stats.totalUsers },
        { label: "Tags", value: stats.totalTags },
        { label: "Extraction Fields", value: stats.totalExtractionFields },
      ],
      actions: [
        {
          label: "Resume Analyzer",
          href: "/upload",
          variant: "primary",
        },
        { label: "Manage Tags", href: "/admin/tags", variant: "secondary" },
        {
          label: "Extraction Fields",
          href: "/admin/extraction-fields",
          variant: "secondary",
        },
      ],
    },
    {
      id: "face-matching",
      title: "AI Face Matching",
      description: "Advanced facial recognition and matching capabilities",
      icon: "👤",
      status: "active",
      stats: [
        { label: "Stored Faces", value: stats.totalStoredFaces || 0 },
        { label: "API Status", value: "Active" },
      ],
      actions: [
        {
          label: "Manage Faces",
          href: "/admin/face-matching",
          variant: "primary",
        },
        {
          label: "Test Matching",
          href: "/face-matching",
          variant: "secondary",
        },
      ],
    },
    {
      id: "coming-soon-2",
      title: "Custom Chatbot",
      description:
        "Subject-based intelligent chatbot with specialized knowledge",
      icon: "🤖",
      status: "inactive",
      stats: [
        { label: "Conversations", value: "0" },
        { label: "Subjects Covered", value: "0" },
      ],
      actions: [{ label: "Coming Soon", href: "#", variant: "outline" }],
    },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await res.json();
      setStats(data);

      // Fetch face matching stats
      await fetchFaceMatchingStats();
    } catch (err: any) {
      console.error("Admin Dashboard - Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaceMatchingStats = async () => {
    try {
      const response = await fetch("/api/admin/face-matching/images");
      if (!response.ok) throw new Error("Failed to fetch face matching stats");
      const data = await response.json();
      setStats((prev) => ({
        ...prev,
        totalStoredFaces: data.images.length,
      }));
    } catch (error: any) {
      console.error("Error fetching face matching stats:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setTesting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const token = Cookies.get("token");
      const res = await fetch("/api/admin/test-resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process resume");
      }

      const result = await res.json();
      setTestResults([
        {
          fileName: file.name,
          result: result,
          timestamp: new Date().toLocaleString(),
        },
        ...testResults,
      ]);
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "🟢";
      case "inactive":
        return "⚪";
      case "maintenance":
        return "🟡";
      default:
        return "⚪";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card">
                  <div className="card-body">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-[#048CE7] to-[#0378c7] rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Manage applications and monitor performance
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-3"
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
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[{ id: "overview", label: "Overview" }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-[#048CE7] text-[#048CE7]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Application Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {applicationCards.map((app) => (
                <div
                  key={app.id}
                  className="card group hover:shadow-lg transition-all duration-300"
                >
                  <div className="card-body">
                    {/* App Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#048CE7] to-[#0378c7] rounded-xl flex items-center justify-center text-white text-lg">
                          {app.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                app.status
                              )}`}
                            >
                              <span className="mr-1">
                                {getStatusIcon(app.status)}
                              </span>
                              {app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {app.description}
                    </p>

                    {/* Stats */}
                    {app.stats && (
                      <div className="space-y-2 mb-4">
                        {app.stats.map((stat, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-500">{stat.label}:</span>
                            <span className="font-medium text-[#048CE7]">
                              {stat.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {app.actions && (
                      <div className="space-y-2">
                        {app.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              action.href !== "#" && router.push(action.href)
                            }
                            disabled={action.href === "#"}
                            className={`w-full text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                              action.variant === "primary"
                                ? "btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                : action.variant === "secondary"
                                ? "btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                : "btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
