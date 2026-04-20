export const APP_NAME = "Mestny Vzglyad";

export const USER_ROLES = {
  TOURIST: "tourist",
  GUIDE: "guide",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
