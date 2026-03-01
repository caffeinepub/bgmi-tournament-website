import React, { createContext, useContext, useState, useCallback } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  credentialsVerified: boolean;
  identityVerified: boolean;
  loginWithCredentials: (username: string, password: string) => boolean;
  loginWithIdentity: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Keep legacy login for backward compat (used nowhere new)
  login: (username: string, password: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  credentialsVerified: false,
  identityVerified: false,
  loginWithCredentials: () => false,
  loginWithIdentity: async () => ({ success: false }),
  logout: () => {},
  login: () => false,
});

const ADMIN_CREDENTIALS_KEY = 'adminCredentialsVerified';
const ADMIN_IDENTITY_KEY = 'adminIdentityVerified';
const ADMIN_USERNAME = 'Empire Esports';
const ADMIN_PASSWORD = 'Shivam803119&';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { login: iiLogin, clear: iiClear, identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [credentialsVerified, setCredentialsVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_CREDENTIALS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [identityVerified, setIdentityVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_IDENTITY_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const isAdminAuthenticated = credentialsVerified && identityVerified;

  const loginWithCredentials = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setCredentialsVerified(true);
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const loginWithIdentity = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Trigger Internet Identity login
      await iiLogin();
    } catch (err: any) {
      // If already authenticated, proceed; otherwise rethrow
      if (err?.message !== 'User is already authenticated') {
        return { success: false, error: 'Internet Identity login failed. Please try again.' };
      }
    }

    // After login, identity should be available — but we need to wait a tick
    // We'll rely on the caller to re-invoke after identity is set
    // Actually, iiLogin resolves after identity is set, so we can proceed
    // We need to get the current identity from the hook — but hooks can't be called here
    // So we use a small delay and check via actor
    await new Promise((r) => setTimeout(r, 800));

    // At this point identity should be set in the II hook
    // We'll verify via backend using the actor (which will be recreated with the new identity)
    // However, actor may not have refreshed yet. We'll use a direct approach:
    // The actor is recreated when identity changes (via useActor), so we need to
    // signal success and let the component re-check.
    // We return a special flag so the component can handle the principal check.
    return { success: true };
  }, [iiLogin]);

  const logout = useCallback(() => {
    setCredentialsVerified(false);
    setIdentityVerified(false);
    localStorage.removeItem(ADMIN_CREDENTIALS_KEY);
    localStorage.removeItem(ADMIN_IDENTITY_KEY);
    iiClear();
    queryClient.clear();
  }, [iiClear, queryClient]);

  // Legacy support
  const login = useCallback((username: string, password: string): boolean => {
    return loginWithCredentials(username, password);
  }, [loginWithCredentials]);

  const setIdentityVerifiedAndPersist = useCallback((val: boolean) => {
    setIdentityVerified(val);
    if (val) {
      localStorage.setItem(ADMIN_IDENTITY_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_IDENTITY_KEY);
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        credentialsVerified,
        identityVerified,
        loginWithCredentials,
        loginWithIdentity,
        logout,
        login,
      }}
    >
      <AdminAuthContextInner
        setIdentityVerified={setIdentityVerifiedAndPersist}
        identityVerified={identityVerified}
        credentialsVerified={credentialsVerified}
        actor={actor}
        identity={identity}
      >
        {children}
      </AdminAuthContextInner>
    </AdminAuthContext.Provider>
  );
}

// Inner component to handle identity verification side-effect
interface InnerProps {
  children: React.ReactNode;
  setIdentityVerified: (val: boolean) => void;
  identityVerified: boolean;
  credentialsVerified: boolean;
  actor: any;
  identity: any;
}

function AdminAuthContextInner({
  children,
  setIdentityVerified,
  identityVerified,
  credentialsVerified,
  actor,
  identity,
}: InnerProps) {
  // When credentials are verified and identity becomes available, verify principal
  React.useEffect(() => {
    if (!credentialsVerified || !identity || !actor || identityVerified) return;

    const principal = identity.getPrincipal();
    if (principal.isAnonymous()) return;

    (async () => {
      try {
        // Check if admin principal is already registered
        const adminPrincipal = await actor.getAdminPrincipal();

        if (adminPrincipal === null || adminPrincipal === undefined) {
          // No admin registered yet — register this principal as admin
          const registered = await actor.registerAdminPrincipal(principal);
          if (registered) {
            setIdentityVerified(true);
          }
        } else {
          // Admin already registered — verify this principal matches
          const isAdmin = await actor.isAdminPrincipal(principal);
          if (isAdmin) {
            setIdentityVerified(true);
          }
          // If not matching, identityVerified stays false
        }
      } catch {
        // Verification failed, stay unverified
      }
    })();
  }, [credentialsVerified, identity, actor, identityVerified, setIdentityVerified]);

  return <>{children}</>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
