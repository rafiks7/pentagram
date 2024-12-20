'use client'

import Link from 'next/link'
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs'

export default function Header() {
  const { isSignedIn, user } = useUser()

  return (
    <header className="bg-gray-800 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
          </div>
          <div className="ml-10 space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-700">
                  Welcome, {user.firstName || user.username}!
                </span>
                <SignOutButton>
                  <button className="inline-block bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75">
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-block bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

