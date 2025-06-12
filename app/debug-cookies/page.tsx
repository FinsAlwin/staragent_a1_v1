"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function DebugCookies() {
  const [cookieValue, setCookieValue] = useState<string | null>(null);
  const [allCookies, setAllCookies] = useState<string>("");

  useEffect(() => {
    const token = Cookies.get("token");
    setCookieValue(token || null);
    setAllCookies(document.cookie);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cookie Debug</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Token Cookie:</h2>
          <p className="bg-gray-100 p-2 rounded">
            {cookieValue
              ? `Found: ${cookieValue.substring(0, 20)}...`
              : "Not found"}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">All Cookies:</h2>
          <p className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
            {allCookies || "No cookies found"}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Document Cookie:</h2>
          <p className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
            {typeof document !== "undefined"
              ? document.cookie
              : "Document not available"}
          </p>
        </div>
      </div>
    </div>
  );
}
