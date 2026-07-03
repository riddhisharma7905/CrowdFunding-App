"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { X, Search, Users } from "lucide-react";

interface Follower {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
}

export default function FollowersModal({
  isOpen,
  onClose,
  count,
}: FollowersModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/profile/followers")
        .then((res) => res.json())
        .then((data) => {
          setFollowers(data.followers || []);
        })
        .finally(() => setLoading(false));
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredFollowers = useMemo(() => {
    return followers.filter((f) =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [followers, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {}
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col h-[500px] overflow-hidden">
        {}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight font-display">
                Followers
              </h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {count} {count === 1 ? "Person" : "People"} supporting you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full h-8 w-8 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div className="p-4 border-b border-slate-50">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search followers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-3.5 text-base font-bold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-slate-400 font-medium italic">
              Loading followers...
            </div>
          ) : filteredFollowers.length > 0 ? (
            <div className="space-y-1">
              {filteredFollowers.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/profile/${follower.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all group"
                >
                  {follower.profilePicture ? (
                    <img
                      src={follower.profilePicture}
                      alt={follower.fullName}
                      className="h-12 w-12 rounded-full object-cover shadow-sm border border-emerald-50 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700 shadow-sm border border-emerald-50 group-hover:scale-105 transition-transform">
                      {follower.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {follower.fullName}
                    </p>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {follower.email}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    View Profile
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <Users size={32} />
              </div>
              <p className="text-sm font-semibold text-slate-400 italic">
                {searchQuery
                  ? `No followers found for "${searchQuery}"`
                  : "You don't have any followers yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
