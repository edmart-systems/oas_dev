@echo off
echo Creating and pushing auto-draft feature branch...

REM Create and switch to new branch
git checkout -b feature/quotation-auto-draft

REM Add all changes
git add .

REM Commit with meaningful message
git commit -m "feat: Implement comprehensive quotation auto-draft system

- Add auto-save functionality with 2-minute intervals and inactivity triggers
- Create recovery modal with persistent display and confirmation dialogs
- Implement database schema with draft_type, timestamps, and indexing
- Add API endpoints for auto-draft CRUD operations
- Integrate auto-draft checker on quotations page for seamless recovery
- Support both dark/light themes with consistent modal styling
- Auto-cleanup system to prevent database clutter
- Smart content detection and change tracking for optimized performance
- Include auto-drafts in regular drafts list with proper metadata
- Add comprehensive documentation and implementation guide

Fixes: User data loss during inactivity timeouts
Enhances: User experience with automatic progress preservation"

REM Push to remote repository
git push -u origin feature/quotation-auto-draft

echo.
echo ✅ Auto-draft feature branch created and pushed successfully!
echo Branch: feature/quotation-auto-draft
echo.
echo Next steps:
echo 1. Run database migration: npx prisma migrate dev
echo 2. Generate Prisma client: npx prisma generate  
echo 3. Test the auto-draft functionality
echo 4. Create pull request when ready
pause