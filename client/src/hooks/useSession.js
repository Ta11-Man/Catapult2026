import { useEffect, useMemo, useState } from 'react';

const SESSION_STORAGE_KEY = 'catapult_session_v1';

function createPlaceholderProof() {
  return {
    merkle_root: 'mock_merkle_root',
    proof: 'mock_world_id_proof',
    verification_level: 'device',
    credential_type: 'orb'
  };
}

function buildMockSession(loginMethod) {
  const suffix = Math.random().toString(36).slice(2, 10);
  const nullifier = `${loginMethod}_nullifier_${suffix}`;

  return {
    isLoggedIn: true,
    loginMethod,
    verifiedNullifier: nullifier,
    hasSubmitted: false,
    createdAt: new Date().toISOString(),
    identity: {
      nullifier_hash: nullifier,
      ...createPlaceholderProof()
    }
  };
}

export function useSession() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) {
      return {
        isLoggedIn: false,
        loginMethod: null,
        verifiedNullifier: null,
        hasSubmitted: false,
        createdAt: null,
        identity: null
      };
    }

    try {
      const parsed = JSON.parse(saved);
      return {
        isLoggedIn: Boolean(parsed.isLoggedIn),
        loginMethod: parsed.loginMethod || null,
        verifiedNullifier: parsed.verifiedNullifier || null,
        hasSubmitted: Boolean(parsed.hasSubmitted),
        createdAt: parsed.createdAt || null,
        identity: parsed.identity || null
      };
    } catch {
      return {
        isLoggedIn: false,
        loginMethod: null,
        verifiedNullifier: null,
        hasSubmitted: false,
        createdAt: null,
        identity: null
      };
    }
  });

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const loginWithWorldId = () => {
    setSession(buildMockSession('world_id'));
  };

  const createWithoutLogin = () => {
    setSession(buildMockSession('guest'));
  };

  const setVerifiedNullifier = (verifiedNullifier) => {
    setSession((prev) => ({
      ...prev,
      isLoggedIn: Boolean(verifiedNullifier),
      verifiedNullifier
    }));
  };

  const setHasSubmitted = (hasSubmitted) => {
    setSession((prev) => ({
      ...prev,
      hasSubmitted
    }));
  };

  const worldIdResponse = useMemo(() => {
    if (!session.identity) {
      return null;
    }
    return {
      nullifier_hash: session.identity.nullifier_hash,
      proof: session.identity.proof,
      merkle_root: session.identity.merkle_root,
      verification_level: session.identity.verification_level,
      credential_type: session.identity.credential_type
    };
  }, [session.identity]);

  return {
    ...session,
    worldIdResponse,
    loginWithWorldId,
    createWithoutLogin,
    setVerifiedNullifier,
    setHasSubmitted
  };
}
