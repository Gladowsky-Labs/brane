'use client';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface User {
  name: string;
  email: string;
  image?: string;
}

export function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await authClient.getSession();
      if (session.data?.user) {
        setUser(session.data.user as User);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="border-b border-zinc-200 dark:border-[#4A4A4B] bg-white dark:bg-[#1E1E1F]">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-light text-zinc-900 dark:text-[#E8E8E8]">
          brane
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-[#3A3A3B] flex items-center justify-center text-zinc-700 dark:text-[#BFC0BF] text-xs font-medium">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#2D2D2E] border border-zinc-200 dark:border-[#4A4A4B] rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-[#4A4A4B]">
                <p className="text-sm font-medium text-zinc-900 dark:text-[#E8E8E8]">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-[#BFC0BF] truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-zinc-700 dark:text-[#BFC0BF] hover:bg-zinc-50 dark:hover:bg-[#3A3A3B] transition-colors"
              >
                sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
