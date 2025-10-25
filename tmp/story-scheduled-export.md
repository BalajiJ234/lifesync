As a proactive user, I want LifeSync to schedule automatic exports of my data so that I always have a recent backup stored in a location I control.

Acceptance Criteria:
- [ ] Allow configuring export frequency (weekly, bi-weekly, monthly)
- [ ] Let users choose export destination (download folder, WebDAV, or manual reminder)
- [ ] Perform exports locally and save encrypted file if encryption is enabled
- [ ] Notify the user when an export succeeds or fails (NotificationBanner)
- [ ] Queue exports while offline and execute when device reconnects
- [ ] Provide history/log of export attempts in Settings

Notes:
- Integrate with existing export format to maintain compatibility
- Ensure scheduling runs in the background when PWA is installed (service worker)
- Respect user preferences and allow pausing/resuming schedule
