export interface UserProfile {
  fullName: string;
  headline: string;
  level: "student" | "junior" | "mid" | "senior";
  skills: string[];
  completed: boolean;
}

const STORAGE_KEY = "interviewpilot_profile";

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Partial<UserProfile>): UserProfile {
  const existing = getProfile() ?? {
    fullName: "",
    headline: "",
    level: "mid",
    skills: [],
    completed: false,
  };
  const merged = { ...existing, ...profile };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function isProfileComplete(): boolean {
  const p = getProfile();
  return !!(p?.fullName?.trim() && p?.completed);
}
