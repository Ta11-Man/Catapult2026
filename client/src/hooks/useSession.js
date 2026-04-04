import { useState } from 'react';

export function useSession() {
  const [verifiedNullifier, setVerifiedNullifier] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  return {
    verifiedNullifier,
    hasSubmitted,
    setVerifiedNullifier,
    setHasSubmitted
  };
}

