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

export async function trackUserActivity(data: any) { return; }
export async function incrementChatCount(userId: string) { return; }
export async function updateAdminSettings(settings: Partial<AdminSettings>) { return false; }
