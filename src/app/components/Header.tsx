"use client";

import Link from "next/link";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn, user } = useUser();
  return (
    <header className="bg-gray-800 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            {/* Logo or Branding Section (if needed) */}
          </div>
          <div className="ml-10 space-x-6 flex items-center">
            {isSignedIn ? (
              <div className="flex items-center space-x-6">
                <span className="text-lg font-semibold text-blue-500">
                  Welcome, {user.firstName || user.username}!
                </span>
                <SignOutButton>
                  <button className="inline-block bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200">
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-block bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
