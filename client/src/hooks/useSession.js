import { useMemo, useState } from 'react';

function createPlaceholderProof() {
  return {
    merkle_root: 'mock_merkle_root',
    proof: 'mock_world_id_proof',
    verification_level: 'device',
    credential_type: 'orb'
  };
}

function buildMockSession(loginMethod, includeIdentity = false) {
  const suffix = Math.random().toString(36).slice(2, 10);
  const nullifier = `${loginMethod}_nullifier_${suffix}`;

  return {
    isLoggedIn: true,
    loginMethod,
    verifiedNullifier: nullifier,
    hasSubmitted: false,
    createdAt: new Date().toISOString(),
    identity: includeIdentity
      ? {
        nullifier_hash: nullifier,
        ...createPlaceholderProof()
      }
      : null
  };
}

function createEmptySession() {
  return {
    isLoggedIn: false,
    loginMethod: null,
    verifiedNullifier: null,
    hasSubmitted: false,
    createdAt: null,
    identity: null
  };
}

export function useSession() {
  const [session, setSession] = useState(createEmptySession);

  const loginWithWorldId = () => {
    setSession(buildMockSession('world_id', true));
  };

  const createWithoutLogin = () => {
    setSession(buildMockSession('guest'));
  };

  const setVerifiedNullifier = (verifiedNullifier) => {
    setSession((prev) => ({
      ...prev,
      isLoggedIn: Boolean(verifiedNullifier),
      verifiedNullifier,
      hasSubmitted: prev.verifiedNullifier === verifiedNullifier ? prev.hasSubmitted : false
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
