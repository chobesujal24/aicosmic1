import {
  doc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { firebaseDb } from "./firebase";

/**
 * Track user activity in Firestore for admin dashboard.
 * Called on each chat message from the API route.
 */
export async function trackUserActivity({
  userId,
  email,
  ip,
  location,
}: {
  userId: string;
  email: string;
  ip: string | null;
  location: string;
}) {
  if (!userId || !email) return;

  try {
    const userRef = doc(firebaseDb, "user_tracking", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        lastActive: serverTimestamp(),
        totalMessages: increment(1),
        ip: ip || "Unknown",
        location: location || "Unknown",
        email,
      });
    } else {
      await setDoc(userRef, {
        email,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        totalMessages: 1,
        chatCount: 0,
        ip: ip || "Unknown",
        location: location || "Unknown",
      });
    }
  } catch (error) {
    // Non-critical: don't fail the chat request if tracking fails
    console.error("Admin tracking error:", error);
  }
}

export async function incrementChatCount(userId: string) {
  if (!userId) return;
  try {
    const userRef = doc(firebaseDb, "user_tracking", userId);
    await updateDoc(userRef, {
      chatCount: increment(1),
    });
  } catch (error) {
    console.error("Chat count tracking error:", error);
  }
}

export type AdminSettings = {
  defaultLimit: number;
  bannedIps: string[];
  bannedEmails: string[];
};

export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const settingsRef = doc(firebaseDb, "admin_settings", "config");
    const settingsDoc = await getDoc(settingsRef);
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        defaultLimit: data.defaultLimit ?? 10,
        bannedIps: data.bannedIps || [],
        bannedEmails: data.bannedEmails || [],
      };
    }
  } catch (error) {
    console.error("Failed to get admin settings:", error);
  }
  return {
    defaultLimit: 10,
    bannedIps: [],
    bannedEmails: [],
  };
}

export async function updateAdminSettings(settings: Partial<AdminSettings>) {
  try {
    const settingsRef = doc(firebaseDb, "admin_settings", "config");
    await setDoc(settingsRef, settings, { merge: true });
    return true;
  } catch (error) {
    console.error("Failed to update admin settings:", error);
    return false;
  }
}
