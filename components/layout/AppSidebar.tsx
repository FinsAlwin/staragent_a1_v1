"use client";
import React from "react";
import Link from "next/link";

export interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  links: SidebarLink[];
  pathname: string;
  onLogout?: () => void;
  userInfo?: React.ReactNode;
  title?: string;
  logo?: React.ReactNode;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  links,
  pathname,
  onLogout,
  userInfo,
  title = "Star Agent AI",
  logo,
}) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-800/80 backdrop-blur-xl shadow-2xl border-r border-gray-700/50 w-64">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-6 mb-4">
          {logo || (
            <div className="w-10 h-10 bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white text-2xl">🧑‍💻</span>
            </div>
          )}
          <span className="text-white font-bold text-xl">{title}</span>
        </div>
        {userInfo && <div className="px-6 mb-4">{userInfo}</div>}
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`$ {
                pathname === item.href
                  ? "bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-[#90caf9]"
              } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
            >
              <span className="mr-3 h-5 w-5 flex-shrink-0 text-xl">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {onLogout && (
        <div className="flex flex-shrink-0 border-t border-gray-700/50 p-4">
          <button
            onClick={onLogout}
            className="group block w-full flex-shrink-0"
          >
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
      )}
    </div>
  );
};

export default AppSidebar;
