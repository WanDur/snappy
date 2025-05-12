import { AxiosInstance } from "axios";
import validator from "validator";
import { z } from "zod";

export enum UserTier {
  FREEMIUM = "freemium",
  PREMIUM = "premium",
  ADMIN = "admin",
}

export const LoginInfoResponseSchema = z.object({
  accessToken: z.string(),
  accessExpireTime: z.number().int().nonnegative(),
  refreshToken: z.string(),
  refreshExpireTime: z.number().int().nonnegative(),
  userTier: z.enum([UserTier.FREEMIUM, UserTier.PREMIUM, UserTier.ADMIN]),
  userId: z.string(),
});

export type LoginInfoResponse = z.infer<typeof LoginInfoResponseSchema>;

export const SessionSchema = LoginInfoResponseSchema.omit({
  accessToken: true,
  refreshToken: true,
});

export type SessionType = z.infer<typeof SessionSchema>;

export type AuthContextProps = {
  signInWithCredential: (
    emailUsernamePhone: string,
    password: string
  ) => Promise<void>;
  signUpWithCredential: (formData: SignUpBody) => Promise<void>;
  signOut: () => Promise<void>;
  session: SessionType | null;
  apiWithToken: AxiosInstance;
  refreshAccessTokenRequest: () => Promise<string | null>;

  useWebSocketWithToken: (
    path: string,
    forceNew?: boolean
  ) => Promise<WebSocket | null>;
  isSocketOpen: (path: string) => boolean;
};

export const SignUpBodySchema = z.object({
  username: z.string().min(4).max(30),
  email: z.string().email(),
  password: z.string().refine((val) => validator.isStrongPassword(val)),
  name: z.string(),
  phone: z.string(),
});

export type SignUpBody = z.infer<typeof SignUpBodySchema>;
