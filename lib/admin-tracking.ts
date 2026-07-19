export type AdminSettings = {
  defaultLimit: number;
  bannedIps: string[];
  bannedEmails: string[];
};

export async function getAdminSettings(): Promise<AdminSettings> {
  return {
    defaultLimit: 1000,
    bannedIps: [],
    bannedEmails: [],
  };
}

export async function trackUserActivity() { return; }
export async function incrementChatCount() { return; }
export async function updateAdminSettings() { return false; }
