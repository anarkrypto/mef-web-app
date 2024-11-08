export type AuthProvider = "discord" | "telegram" | "wallet";

export interface UserInfo {
  username: string;
  authSource: {
    type: AuthProvider;
    id: string;
  };
}
