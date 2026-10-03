import * as SecureStore from "expo-secure-store";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, apiRequest, normalizeIranPhone } from "../api/client";

const TOKEN_KEY = "khonenama_business_access_token";

export type BusinessProfile = {
  owner: { id: string; fullName: string; phone: string; phoneVerified: boolean };
  business: {
    id: number; slug: string; name: string; description: string; city: string;
    area: string | null; address: string | null; phone: string | null;
    whatsapp: string | null; website: string | null; instagram: string | null;
    status: string; completion: number; leadCount: number; verification_status: string;
    plan: { code: string; name: string; ends_at: string | null } | null;
    services: { id: number; slug: string; name: string }[];
    serviceAreas: { id: number; city: string; area: string; is_primary: number }[];
  };
};

type SessionContextValue = {
  token: string | null;
  profile: BusinessProfile | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function BusinessSessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (value: string) => {
    const result = await apiRequest<BusinessProfile & { ok: true }>("/api/me/business", {}, value);
    setProfile({ owner: result.owner, business: result.business });
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          setToken(saved);
          try { await loadProfile(saved); }
          catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              setToken(null);
              await SecureStore.deleteItemAsync(TOKEN_KEY);
            }
          }
        }
      } catch { /* SecureStore can be retried on the next launch. */ } finally {
        setLoading(false);
      }
    })();
  }, [loadProfile]);

  const saveSession = useCallback(async (value: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, value);
    setToken(value);
    await loadProfile(value);
  }, [loadProfile]);

  const login = useCallback(async (phone: string, password: string) => {
    const result = await apiRequest<{ ok: true; accessToken: string }>("/api/auth/business/login", {
      method: "POST", body: JSON.stringify({ phone: normalizeIranPhone(phone), password }),
    });
    await saveSession(result.accessToken);
  }, [saveSession]);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    const result = await apiRequest<{ ok: true; session: { accessToken: string } }>("/api/businesses/register", {
      method: "POST", body: JSON.stringify(payload),
    });
    await saveSession(result.session.accessToken);
  }, [saveSession]);

  const logout = useCallback(async () => {
    const current = token;
    setToken(null); setProfile(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    if (current) await apiRequest("/api/auth/logout", { method: "POST" }, current).catch(() => undefined);
  }, [token]);

  const refresh = useCallback(async () => { if (token) await loadProfile(token); }, [loadProfile, token]);
  const value = useMemo(() => ({ token, profile, loading, login, register, logout, refresh }), [token, profile, loading, login, register, logout, refresh]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useBusinessSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("BusinessSessionProvider is missing");
  return value;
}
