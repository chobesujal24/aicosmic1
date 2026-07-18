"use client";

import {
  XIcon,
  UsersIcon,
  MessageSquareIcon,
  MapPinIcon,
  ActivityIcon,
  RefreshCwIcon,
  GlobeIcon,
  ClockIcon,
  MailIcon,
  SettingsIcon,
  BanIcon,
  CheckCircleIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb, googleProvider, isAdminUser } from "@/lib/firebase";

type UserData = {
  email: string;
  lastActive: string;
  totalMessages: number;
  ip: string;
  location: string;
  createdAt: string;
  chatCount: number;
};

type AdminStats = {
  totalUsers: number;
  totalMessages: number;
  activeToday: number;
  users: UserData[];
};

type AdminSettings = {
  defaultLimit: number;
  bannedIps: string[];
  bannedEmails: string[];
};

export function useAdminAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setFirebaseUser(user);
      setIsAdmin(isAdminUser(user?.email));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInAsAdmin = useCallback(async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      if (!isAdminUser(result.user.email)) {
        await firebaseSignOut(firebaseAuth);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  return { firebaseUser, isAdmin, loading, signInAsAdmin };
}

export function AdminPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { firebaseUser, isAdmin, loading, signInAsAdmin } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users");
  const [settings, setSettings] = useState<AdminSettings>({ defaultLimit: 10, bannedIps: [], bannedEmails: [] });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingStats(true);
    try {
      const usersRef = collection(firebaseDb, "user_tracking");
      const q = query(usersRef, orderBy("lastActive", "desc"), limit(100));
      const snapshot = await getDocs(q);

      const users: UserData[] = [];
      let totalMessages = 0;
      let activeToday = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const userData: UserData = {
          email: data.email || "Unknown",
          lastActive: data.lastActive?.toDate?.()?.toISOString?.() || "N/A",
          totalMessages: data.totalMessages || 0,
          ip: data.ip || "Unknown",
          location: data.location || "Unknown",
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || "N/A",
          chatCount: data.chatCount || 0,
        };
        users.push(userData);
        totalMessages += userData.totalMessages;

        if (data.lastActive?.toDate?.() >= today) {
          activeToday++;
        }
      });

      setStats({
        totalUsers: users.length,
        totalMessages,
        activeToday,
        users,
      });

      // Fetch admin settings
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/admin/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [isAdmin]);

  const saveSettings = async (newSettings: AdminSettings) => {
    setSavingSettings(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        setSettings(newSettings);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleBan = async (type: "ip" | "email", value: string) => {
    const newSettings = { ...settings };
    if (type === "ip" && !newSettings.bannedIps.includes(value)) {
      newSettings.bannedIps = [...newSettings.bannedIps, value];
    } else if (type === "email" && !newSettings.bannedEmails.includes(value)) {
      newSettings.bannedEmails = [...newSettings.bannedEmails, value];
    }
    await saveSettings(newSettings);
  };

  const handleUnban = async (type: "ip" | "email", value: string) => {
    const newSettings = { ...settings };
    if (type === "ip") {
      newSettings.bannedIps = newSettings.bannedIps.filter(ip => ip !== value);
    } else if (type === "email") {
      newSettings.bannedEmails = newSettings.bannedEmails.filter(e => e !== value);
    }
    await saveSettings(newSettings);
  };

  useEffect(() => {
    if (open && isAdmin) {
      fetchStats();
    }
  }, [open, isAdmin, fetchStats]);

  const handleAdminLogin = useCallback(async () => {
    setAuthAttempted(true);
    await signInAsAdmin();
  }, [signInAsAdmin]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[60] w-full max-w-lg overflow-hidden border-l border-border/30 bg-card/98 backdrop-blur-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20">
                  <ActivityIcon className="size-4 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
                  <p className="text-[11px] text-muted-foreground">Restricted Access</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="h-[calc(100vh-73px)] overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                </div>
              ) : !isAdmin ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
                    <ActivityIcon className="size-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Admin Authentication</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Sign in with your admin Google account to access the dashboard.
                  </p>
                  {authAttempted && !isAdmin && (
                    <p className="mt-2 text-center text-xs text-red-400">
                      Access denied. This account is not authorized.
                    </p>
                  )}
                  <button
                    onClick={handleAdminLogin}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    <svg className="size-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="mb-6 grid grid-cols-3 gap-3">
                    <StatCard
                      icon={<UsersIcon className="size-4" />}
                      label="Total Users"
                      value={stats?.totalUsers ?? 0}
                      color="zinc"
                    />
                    <StatCard
                      icon={<MessageSquareIcon className="size-4" />}
                      label="Total Messages"
                      value={stats?.totalMessages ?? 0}
                      color="blue"
                    />
                    <StatCard
                      icon={<ActivityIcon className="size-4" />}
                      label="Active Today"
                      value={stats?.activeToday ?? 0}
                      color="green"
                    />
                  </div>

                  {/* Tabs */}
                  <div className="mb-6 flex space-x-2 border-b border-border/30 pb-2">
                    <button
                      onClick={() => setActiveTab("users")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "users" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Users
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "settings" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Settings & Security
                    </button>
                  </div>

                  {activeTab === "settings" ? (
                    <div className="space-y-6">
                      <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
                        <h3 className="mb-3 text-sm font-semibold flex items-center gap-2"><SettingsIcon className="size-4" /> Rate Limiting</h3>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-muted-foreground">Default messages per hour for regular users:</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={settings.defaultLimit}
                              onChange={(e) => setSettings({...settings, defaultLimit: parseInt(e.target.value) || 0})}
                              className="w-24 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-sm text-foreground"
                            />
                            <button 
                              onClick={() => saveSettings(settings)}
                              disabled={savingSettings}
                              className="rounded-lg bg-foreground px-4 py-1.5 text-xs font-medium text-background"
                            >
                              {savingSettings ? "Saving..." : "Save Limit"}
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">Note: Admin accounts are completely exempt from all limits.</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
                        <h3 className="mb-3 text-sm font-semibold flex items-center gap-2 text-red-400"><BanIcon className="size-4" /> Banned IPs</h3>
                        {settings.bannedIps.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No banned IPs.</p>
                        ) : (
                          <div className="space-y-2">
                            {settings.bannedIps.map(ip => (
                              <div key={ip} className="flex items-center justify-between rounded bg-background p-2 border border-border/30">
                                <span className="text-xs font-mono">{ip}</span>
                                <button onClick={() => handleUnban("ip", ip)} className="text-[10px] text-red-400 hover:underline">Unban</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
                        <h3 className="mb-3 text-sm font-semibold flex items-center gap-2 text-red-400"><BanIcon className="size-4" /> Banned Emails</h3>
                        {settings.bannedEmails.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No banned emails.</p>
                        ) : (
                          <div className="space-y-2">
                            {settings.bannedEmails.map(email => (
                              <div key={email} className="flex items-center justify-between rounded bg-background p-2 border border-border/30">
                                <span className="text-xs">{email}</span>
                                <button onClick={() => handleUnban("email", email)} className="text-[10px] text-red-400 hover:underline">Unban</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>

                  {/* Refresh */}
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">User Activity</h3>
                    <button
                      onClick={fetchStats}
                      disabled={loadingStats}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <RefreshCwIcon className={`size-3 ${loadingStats ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>

                  {/* Users Table */}
                  {loadingStats ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                    </div>
                  ) : stats?.users?.length ? (
                    <div className="space-y-2">
                      {stats.users.map((user, i) => (
                        <motion.div
                          key={user.email + i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="rounded-xl border border-border/30 bg-muted/10 p-4 transition-colors hover:bg-muted/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold text-foreground/70">
                                {user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-foreground">{user.email}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <MessageSquareIcon className="size-3" />
                                    {user.totalMessages} msgs
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <GlobeIcon className="size-3" />
                                    {user.ip}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              {settings.bannedEmails.includes(user.email) ? (
                                <button onClick={() => handleUnban("email", user.email)} className="text-[10px] text-green-500 hover:underline flex items-center gap-1"><CheckCircleIcon className="size-3" /> Unban Email</button>
                              ) : (
                                <button onClick={() => handleBan("email", user.email)} className="text-[10px] text-red-400 hover:underline flex items-center gap-1"><BanIcon className="size-3" /> Ban Email</button>
                              )}
                              
                              {user.ip !== "Unknown" && (
                                settings.bannedIps.includes(user.ip) ? (
                                  <button onClick={() => handleUnban("ip", user.ip)} className="text-[10px] text-green-500 hover:underline flex items-center gap-1"><CheckCircleIcon className="size-3" /> Unban IP</button>
                                ) : (
                                  <button onClick={() => handleBan("ip", user.ip)} className="text-[10px] text-red-400 hover:underline flex items-center gap-1"><BanIcon className="size-3" /> Ban IP</button>
                                )
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground/70">
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="size-3" />
                              {user.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="size-3" />
                              {user.lastActive !== "N/A"
                                ? new Date(user.lastActive).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <UsersIcon className="size-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No user data yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        User activity will appear here as people use the app.
                      </p>
                    </div>
                  )}
                  </>
                )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    zinc: "from-zinc-500/15 to-neutral-500/10 text-zinc-400",
    blue: "from-blue-500/15 to-cyan-500/10 text-blue-400",
    green: "from-green-500/15 to-emerald-500/10 text-green-400",
  };

  return (
    <div className={`rounded-xl border border-border/30 bg-gradient-to-br ${colorMap[color]} p-3`}>
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-[10px] font-medium opacity-70">{label}</span></div>
      <p className="text-xl font-bold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}
