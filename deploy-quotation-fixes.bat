@echo off
echo Creating and pushing quotation analytics and filter fixes...

REM Create and switch to new branch
git checkout -b fix/quotation-analytics-and-filters

REM Add all changes
git add .

REM Commit with meaningful message
git commit -m "fix: Resolve quotation analytics sync and filter pagination issues

- Add automatic refresh every 30 seconds for analytics cards to keep counts current
- Implement immediate refresh on mount to sync with real-time data
- Reset pagination offset and page to 0 when applying new filters
- Fix double counting issue in status count query (main + edited quotations)
- Prevent 'No quotations found' error when valid search results exist
- Ensure analytics cards display accurate database counts
- Improve filter result display consistency

Fixes: Analytics showing stale/incorrect counts
Fixes: Filter results showing wrong pagination state
Enhances: Real-time data synchronization between analytics and table"

REM Push to remote repository
git push -u origin fix/quotation-analytics-and-filters

echo.
echo ✅ Quotation fixes branch created and pushed successfully!
echo Branch: fix/quotation-analytics-and-filters
echo.
echo Changes included:
echo - Analytics auto-refresh functionality
echo - Filter pagination reset fix
echo - Double counting prevention
echo - Real-time count synchronization
echo.
echo Ready for pull request review!
pause