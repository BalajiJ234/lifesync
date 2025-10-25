As a privacy-first user, I want an optional encrypted backup workflow so that I can protect against device loss while keeping full control of my encryption keys.

Acceptance Criteria:
- [ ] User can enable/disable encrypted backup from Settings (opt-in default off)
- [ ] Prompt user to generate or supply an encryption passphrase/key (never stored remotely)
- [ ] Allow backing up to user-selected destination (e.g., local download, WebDAV, or custom cloud path)
- [ ] Perform encryption locally before any data leaves the device
- [ ] Provide restore flow that requires the correct key/passphrase
- [ ] Respect offline mode and queue backups until connectivity is available

Notes:
- Explore APIs for user-managed destinations (e.g., WebDAV, manual upload)
- Ensure backup file can be decrypted with open-source tooling for transparency
- Document recovery process clearly in PRIVACY.md
