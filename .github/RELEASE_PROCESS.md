# LifeSync - Release Best Practices

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0): Breaking changes, major redesigns
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, minor improvements

## Release Labels

Use these labels to categorize issues and PRs:

### Priority
- `priority: critical` - Blocking issues, security vulnerabilities
- `priority: high` - Important features or bugs
- `priority: medium` - Should have, but not urgent
- `priority: low` - Nice to have

### Type
- `type: feature` - New functionality
- `type: bug` - Something isn't working
- `type: enhancement` - Improvement to existing feature
- `type: refactor` - Code cleanup, no functional change
- `type: docs` - Documentation updates
- `type: test` - Adding or updating tests

### Status
- `status: planning` - In design/planning phase
- `status: ready` - Ready for development
- `status: in-progress` - Currently being worked on
- `status: review` - In code review
- `status: blocked` - Blocked by dependencies
- `status: done` - Completed

### Area
- `area: ui` - User interface
- `area: api` - API/backend
- `area: data` - Data management
- `area: settings` - Settings/configuration
- `area: pwa` - Progressive Web App features
- `area: ai` - AI categorization features

## Kanban Board Setup

### GitHub Projects Board Columns

1. **📋 Backlog** - Ideas and future work
2. **🎯 Ready** - Prioritized, ready to start
3. **🚧 In Progress** - Currently being worked on
4. **👀 Review** - In code review
5. **✅ Done** - Completed this sprint/release

### Automation Rules

- New issues → Backlog
- Issue assigned → In Progress
- PR opened → Review
- PR merged → Done
- Issue closed → Done

## Release Checklist

### Pre-Release
- [ ] All critical/high priority issues resolved
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG.md updated

### Release Process
1. Create release branch: `release/v1.2.0`
2. Update version: `npm version [major|minor|patch]`
3. Create release notes with:
   - 🎉 New Features
   - 🐛 Bug Fixes
   - 💡 Improvements
   - 🔒 Security
   - ⚠️ Breaking Changes
4. Tag release: `git tag -a v1.2.0 -m "Release v1.2.0"`
5. Push tags: `git push --tags`
6. Create GitHub Release
7. Deploy to production

### Post-Release
- [ ] Verify deployment
- [ ] Monitor for errors
- [ ] Update project board
- [ ] Close milestone
- [ ] Announce release

## Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(expenses): add bulk import functionality
fix(settings): theme toggle not working properly
docs(readme): update installation instructions
```

## Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Feature branches
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Emergency fixes
- `release/vX.Y.Z` - Release preparation

## Sprint Planning

### 2-Week Sprint Cycle

**Week 1:**
- Day 1-2: Planning & design
- Day 3-5: Development

**Week 2:**
- Day 1-3: Testing & review
- Day 4: Bug fixes
- Day 5: Release & retrospective

### Definition of Done

- [ ] Code written and reviewed
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Tested on desktop and mobile
- [ ] No console errors
- [ ] Accessibility checked
- [ ] Performance acceptable
- [ ] Merged to main branch
