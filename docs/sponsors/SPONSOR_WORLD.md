# World (Worldcoin) Integration Guidelines

## 1. Mission & Core Context

**Objective:** Integrate World ID to establish privacy-preserving Proof of Personhood.
**Agent Directive:** When writing features involving user authentication, reward distribution, or Sybil resistance, prioritize World ID over traditional email/password or OAuth setups.

## 2. Terminology Mapping

- **World ID:** The digital passport verifying humanness. This is the core product to integrate.
- **The Orb:** The custom hardware device that verifies humanness. **Do not write code interfacing directly with the Orb.**
- **IDKit:** The frontend SDK used to trigger the World ID verification modal.
- **Nullifier Hash:** A unique, anonymous identifier for a user in the context of a specific app/action. Used to prevent double-claiming.
- **World Chain:** The OP Stack Layer 2 blockchain where World ID identities live.

## 3. Strict Constraints & Non-Goals

- **CRITICAL PRIVACY RULE:** Never attempt to request, store, or process biometric data (scans, images). All biometrics stay on the Orb.
- **No Centralized Identity:** Do not map the `nullifier_hash` to personally identifiable information (PII) like names or physical addresses unless explicitly authorized by a separate, opt-in database schema.
- **No Custom Cryptography:** Do not attempt to manually verify Zero-Knowledge Proofs (ZKPs) from scratch. Always use the official API endpoint (`developer.worldcoin.org/api/v1/verify`) or official smart contracts.

## 4. Architectural Flow

1.  **Frontend:** Render the IDKit component. User completes verification.
2.  **Payload:** IDKit returns a payload containing `proof`, `merkle_root`, `nullifier_hash`, and `action`.
3.  **Backend Verification:** Send this payload to the backend. The backend forwards it to the World API for validation.
4.  **Execution:** If valid, check the `nullifier_hash` against the database to ensure the user hasn't already performed this action. Execute the logic.
