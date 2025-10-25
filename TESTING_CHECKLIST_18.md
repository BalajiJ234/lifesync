# Recurring Expense Templates Testing Checklist (#18)

## Feature Overview
Branch: `feature/18-recurring-expense-templates`
Commits: 5ec0e8c, 8db4878

## ✅ Completed Implementation

### Redux Store
- [x] `recurringTemplatesSlice.ts` with full CRUD actions
- [x] Added to `store/index.ts` rootReducer
- [x] Added to persist whitelist
- [x] Helper functions: `calculateNextDueDate()`, `getUpcomingTemplates()`, `getMissedTemplates()`

### UI Components
- [x] `/expenses/templates` - Full templates management page
- [x] Create/Edit template modal with frequency selection
- [x] Upcoming templates view (30 days)
- [x] Missed payment alerts (7-day grace)
- [x] One-click "Create Expense" from template
- [x] Filter tabs (all/active/paused)
- [x] Template cards with pause/play, edit, delete

### Navigation
- [x] Added "Recurring Templates" to Expenses submenu
- [x] Updated active state detection for `/expenses/` paths

### Dashboard Widget
- [x] `UpcomingRecurringWidget` shows next 7 days
- [x] Overdue status display (red text)
- [x] Days until due counter
- [x] Links to templates page

### Data Persistence
- [x] Export: `recurringTemplates` included in JSON export
- [x] Import: Parse and load templates from backup
- [x] Clear: Remove all templates from store
- [x] Redux Persist: Auto-save to localStorage

---

## 🧪 Manual Testing Guide

### Test 1: Create Recurring Templates
**Navigate to:** Expenses → Recurring Templates

1. **Monthly Rent Template**
   - Click "Create Template"
   - Name: "Monthly Rent"
   - Amount: 1200
   - Currency: USD (or your default)
   - Category: Housing
   - Frequency: Monthly
   - Day of Month: 1
   - Start Date: First of current month
   - Notes: "Apartment rent - due 1st of month"
   - Click Save

2. **Weekly Groceries Template**
   - Click "Create Template"
   - Name: "Grocery Shopping"
   - Amount: 150
   - Currency: USD
   - Category: Food
   - Frequency: Weekly
   - Day of Week: Sunday (0)
   - Start Date: Last Sunday
   - Notes: "Weekly grocery run"
   - Click Save

3. **Quarterly Insurance Template**
   - Click "Create Template"
   - Name: "Car Insurance"
   - Amount: 350
   - Currency: USD
   - Category: Transportation
   - Frequency: Quarterly
   - Start Date: Jan 1, 2025
   - Day of Month: 1
   - Notes: "Renewal every 3 months"
   - Click Save

**Expected Results:**
- [ ] All 3 templates appear in "All Templates" tab
- [ ] Next due dates calculated correctly
- [ ] Frequency badges display properly
- [ ] Template cards show amount, category, notes

### Test 2: Upcoming Templates View
**Check dashboard and templates page**

**Dashboard Widget (Next 7 Days):**
- [ ] "Upcoming Recurring" widget visible on homepage
- [ ] Shows only templates due within 7 days
- [ ] Overdue items show in red
- [ ] "X days until due" counter accurate
- [ ] Clicking template links to `/expenses/templates`

**Templates Page (Next 30 Days):**
- [ ] "Upcoming Expenses" section shows next 30 days
- [ ] Grouped by template with due dates
- [ ] "Create Expense" button visible for each
- [ ] Amounts and categories display correctly

### Test 3: One-Click Expense Creation
**Navigate to:** Expenses → Recurring Templates → Upcoming Expenses

1. Click "Create Expense" on Weekly Groceries template
   - **Expected:**
     - [ ] Redirects to `/expenses` page
     - [ ] Expense form auto-fills with template data (amount, category, notes)
     - [ ] Date defaults to today
     - [ ] Can edit before saving

2. Submit the expense
   - **Expected:**
     - [ ] Expense appears in expenses list
     - [ ] Template's `lastGenerated` updates
     - [ ] Template's `nextDue` recalculates

### Test 4: Missed Payment Detection
**Manually test grace period logic**

1. Create a test template with past due date:
   - Name: "Overdue Bill"
   - Amount: 100
   - Frequency: Monthly
   - Start Date: 10 days ago
   - Day of Month: (10 days ago)

2. Check missed alerts:
   - **Expected:**
     - [ ] Red alert banner appears: "X Missed Payments"
     - [ ] Template shows in missed section
     - [ ] AlertTriangle icon visible
     - [ ] Can still create expense from missed template

### Test 5: Pause/Resume Templates
**Test active/paused states**

1. Click "Pause" on Monthly Rent template
   - **Expected:**
     - [ ] Button changes to "Resume"
     - [ ] Template moves to "Paused" tab
     - [ ] No longer appears in upcoming view
     - [ ] Grayed out or marked as inactive

2. Click "Resume" to reactivate
   - **Expected:**
     - [ ] Button changes back to "Pause"
     - [ ] Template returns to "Active" tab
     - [ ] Appears in upcoming view again

### Test 6: Edit Templates
1. Click "Edit" on Grocery Shopping template
2. Change amount from 150 to 175
3. Change day of week to Saturday (6)
4. Click Save
   - **Expected:**
     - [ ] Modal closes
     - [ ] Template card updates with new amount
     - [ ] Next due date recalculates for Saturday

### Test 7: Delete Templates
1. Click "Delete" on Quarterly Insurance template
2. Confirm deletion
   - **Expected:**
     - [ ] Confirmation modal appears
     - [ ] After confirm, template removed from list
     - [ ] No longer in upcoming view
     - [ ] No longer in dashboard widget

### Test 8: Export/Import/Clear Data
**Navigate to:** Settings

1. **Export Test:**
   - Click "Export All Data"
   - Save JSON file
   - Open file in text editor
   - **Expected:**
     - [ ] `recurringTemplates` array present
     - [ ] All template fields intact (id, name, amount, frequency, nextDue, etc.)

2. **Clear Test:**
   - Click "Clear All Data" → Confirm
   - **Expected:**
     - [ ] All templates removed
     - [ ] Templates page shows empty state
     - [ ] Dashboard widget disappears

3. **Import Test:**
   - Click "Import Data"
   - Select previously exported JSON
   - **Expected:**
     - [ ] Success message: "X recurring templates imported"
     - [ ] Templates reappear in list
     - [ ] nextDue dates correct
     - [ ] Dashboard widget returns

### Test 9: Frequency Calculations
**Verify date logic for each frequency type**

Create templates with specific dates and verify nextDue:

**Weekly:**
- Start Date: Dec 15, 2024 (Sunday)
- Expected Next: Next Sunday after today

**Biweekly:**
- Start Date: Dec 1, 2024
- Expected Next: Dec 15, Dec 29, Jan 12...

**Monthly:**
- Day of Month: 15
- Expected Next: 15th of current/next month

**Quarterly:**
- Start Date: Jan 1, 2025
- Expected Next: Jan 1, Apr 1, Jul 1, Oct 1...

**Yearly:**
- Start Date: Dec 25, 2024
- Expected Next: Dec 25, 2025

### Test 10: Multi-Currency Support
**Test with different currencies**

1. Create template in INR
2. Create template in AED
3. Create template in USD
4. Create expenses from each
   - **Expected:**
     - [ ] Each template retains its currency
     - [ ] Expenses created with correct currency
     - [ ] Currency symbols display properly

---

## 🐛 Known Issues / Edge Cases to Test

### Edge Case 1: Day of Month > Month Length
- Create monthly template for day 31
- Check behavior in February (28/29 days)
- **Expected:** Should handle gracefully (use last day of month)

### Edge Case 2: Leap Year (2024)
- Monthly template on Feb 29, 2024
- **Expected:** Next occurrence Feb 28, 2025 (non-leap year)

### Edge Case 3: Multiple Templates Same Day
- Create 3 templates all due on same date
- **Expected:** All appear in upcoming view, sorted properly

### Edge Case 4: Very Old Start Dates
- Template from 5 years ago, never generated
- **Expected:** nextDue calculated from today, not accumulating past due dates

---

## 📊 Acceptance Criteria Checklist (From Story #18)

- [x] Users can create reusable templates with name, amount, frequency, category, notes
- [x] Quick expense creation from template
- [x] Overview of upcoming expenses (next 30 days)
- [x] Flag missed payments (7-day grace period)
- [x] Sync template metadata through export/import flows
- [x] Frequency options: weekly, biweekly, monthly, quarterly, yearly
- [x] Local storage only (no network)
- [ ] Template dropdown on expense form (PENDING)
- [ ] Notification reminders (uses NotificationBanner - needs verification)
- [ ] Budget alert integration (future enhancement)

---

## 🚀 Ready for PR?

**Pre-PR Checklist:**
- [x] All core features implemented
- [x] Export/import/clear functionality complete
- [x] No TypeScript errors
- [x] Commits pushed to feature branch
- [ ] Manual testing completed (run tests above)
- [ ] Template dropdown on expense form (optional - can be separate PR)
- [ ] Multi-currency salary tracking documented (separate story)

**Next Steps:**
1. Complete manual testing
2. Fix any bugs found
3. Add template dropdown to expense form (quick enhancement)
4. Push final commits
5. Create PR via GitHub CLI or Codespaces

---

## 📝 Notes

**Performance:**
- All data in localStorage (< 5MB typical)
- Date calculations O(n) where n = number of templates
- No network calls, instant UI updates

**Future Enhancements (Separate PRs):**
- [ ] Template categories/tags for organization
- [ ] Bulk template creation (import CSV)
- [ ] Template sharing (export individual template)
- [ ] Smart notifications 3 days before due
- [ ] Auto-create expenses (optional auto-pay mode)
- [ ] Multi-currency income tracking with history
