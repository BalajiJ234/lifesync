As a security-conscious user, I want to protect LifeSync with my device biometrics so that only I can access my financial data even if someone uses my device.

Acceptance Criteria:
- [ ] Provide optional biometric lock that can be enabled/disabled in Settings
- [ ] Support platform-appropriate APIs (WebAuthn/FIDO2, FaceID/TouchID, Android Biometrics)
- [ ] Require fallback PIN/passphrase setup in case biometrics become unavailable
- [ ] Unlock experience works offline and never sends biometric data to servers
- [ ] Lock engages after configurable inactivity period or on app launch
- [ ] Clear messaging for users whose devices do not support biometrics

Notes:
- Respect browsers that lack biometric APIs and gracefully degrade to PIN-only
- Ensure lock integrates with PWA install (standalone mode)
- Document privacy guarantees in PRIVACY.md
