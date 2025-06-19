"use client";
import React from "react";
import Link from "next/link";

export interface NavItem {
  name: string;
  href: string;
  icon: (props: any) => JSX.Element;
}

interface AdminSidebarProps {
  navigation: NavItem[];
  pathname: string;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  navigation,
  pathname,
  onLogout,
}) => (
  <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
    <div className="flex min-h-0 flex-1 flex-col bg-gray-800/80 backdrop-blur-xl shadow-2xl border-r border-gray-700/50">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-6">
          <div className="w-10 h-10 bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] rounded-xl flex items-center justify-center mr-3 shadow-lg">
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
          <span className="text-white font-bold text-xl">Admin Panel</span>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`$ {
                pathname === item.href
                  ? "bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-[#90caf9]"
              } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-gray-700/50 p-4">
        <button onClick={onLogout} className="group block w-full flex-shrink-0">
          <div className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200">
            <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <svg
                className="h-5 w-5 text-gray-300 group-hover:text-[#90caf9] transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-300 group-hover:text-[#90caf9] transition-colors duration-200">
                Sign out
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
);

export default AdminSidebar;
