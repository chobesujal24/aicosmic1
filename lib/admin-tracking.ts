import { adminDb } from "./firebase-admin";

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
  if (!userId || !email || !adminDb) return;

  try {
    const userRef = adminDb.collection("user_tracking").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        lastActive: new Date(),
        totalMessages: FirebaseAdminIncrement(1),
        ip: ip || "Unknown",
        location: location || "Unknown",
        email,
      });
    } else {
      await userRef.set({
        email,
        createdAt: new Date(),
        lastActive: new Date(),
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
  if (!userId || !adminDb) return;
  try {
    const userRef = adminDb.collection("user_tracking").doc(userId);
    await userRef.update({
      chatCount: FirebaseAdminIncrement(1),
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
  if (!adminDb) {
    return { defaultLimit: 10, bannedIps: [], bannedEmails: [] };
  }
  try {
    const settingsRef = adminDb.collection("admin_settings").doc("config");
    const settingsDoc = await settingsRef.get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data()!;
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
  if (!adminDb) return false;
  try {
    const settingsRef = adminDb.collection("admin_settings").doc("config");
    await settingsRef.set(settings, { merge: true });
    return true;
  } catch (error) {
    console.error("Failed to update admin settings:", error);
    return false;
  }
}

function FirebaseAdminIncrement(n: number) {
  // Safe helper to get FieldValue.increment without messing up imports
  const admin = require('firebase-admin');
  return admin.firestore.FieldValue.increment(n);
}
