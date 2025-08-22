# Quotation Auto-Draft Feature

## Overview
Implemented comprehensive auto-draft functionality for the Quotation module that automatically saves user progress during inactivity and provides seamless recovery options.

## Features Implemented

### ✅ Auto-Save Functionality
- **Periodic Auto-Save**: Saves draft every 2 minutes during active editing
- **Inactivity Auto-Save**: Automatically saves before logout due to inactivity (5-10 minutes)
- **Smart Content Detection**: Only saves when meaningful content exists (client name or line items)
- **Change Tracking**: Optimized to save only when actual changes are made

### ✅ Recovery System
- **Login Recovery Modal**: Appears automatically on quotations page when auto-draft exists
- **Modal Persistence**: Cannot be closed by clicking outside or ESC key
- **Consistent Styling**: Matches existing modal design with theme support (dark/light mode)
- **Accurate Timestamps**: Shows exact database time in format "22 Aug, 2025 at 14:40:10"

### ✅ User Experience
- **Non-Intrusive Messaging**: Clear info about auto-save functionality
- **Confirmation Dialogs**: Discard action requires confirmation to prevent accidental loss
- **Toast Notifications**: Success messages for restore and discard actions
- **Draft Integration**: Auto-drafts appear in regular drafts list alongside manual drafts

### ✅ Data Management
- **Database Schema**: Added `draft_type`, `created_at`, `updated_at` fields with proper indexing
- **Auto-Cleanup**: Auto-drafts deleted when converted to manual drafts or quotations submitted
- **Single Auto-Draft**: Only one auto-draft per user to prevent database clutter
- **Metadata Tracking**: Stores userId, timestamp, and draft type for proper management

## Technical Implementation

### Database Changes
- Migration: `20250122000000_auto_draft_feature`
- New fields: `draft_type` ENUM('manual', 'auto'), `created_at`, `updated_at`
- Index: `idx_user_draft_type` for efficient queries

### API Endpoints
- `POST /api/quotations/auto-draft` - Save auto-draft
- `GET /api/quotations/auto-draft?userId={id}` - Get latest auto-draft  
- `DELETE /api/quotations/auto-draft` - Delete auto-draft

### Key Components
- `AutoDraftRecoveryDialog` - Recovery modal with confirmation
- `QuotationsAutoDraftChecker` - Auto-draft detection on quotations page
- `auto-draft-api.ts` - Client-side API functions
- Enhanced activity monitor with auto-save trigger

## User Flow
1. User creates/edits quotation → Auto-save activates
2. User becomes inactive → System saves draft before logout
3. User logs back in → Recovery modal appears on quotations page
4. User chooses to restore or discard → Appropriate action taken
5. If restored and saved as manual draft → Auto-draft automatically deleted

## Files Modified/Created

### 📁 Database & Schema
- `prisma/migrations/20250122000000_auto_draft_feature/migration.sql` *(NEW)*
- `prisma/schema.prisma` *(UPDATED)*

### 🔧 Backend Services
- `src/services/quotations-service/quotations.repository.ts` *(UPDATED)*
- `src/services/quotations-service/quotations.service.ts` *(UPDATED)*
- `src/app/api/quotations/auto-draft/route.ts` *(NEW)*
- `src/types/quotations.types.ts` *(UPDATED)*

### 🎨 Frontend Components
- `src/components/dashboard/quotations/auto-draft-api.ts` *(NEW)*
- `src/components/dashboard/quotations/auto-draft-recovery-dialog.tsx` *(NEW)*
- `src/components/dashboard/quotations/quotations-auto-draft-checker.tsx` *(NEW)*
- `src/components/dashboard/quotations/create-quotation/create-quotation.tsx` *(UPDATED)*
- `src/components/dashboard/quotations/create-quotation/edit-quotation/edit-quotation.tsx` *(UPDATED)*
- `src/components/auth/ui-activity-monitor.tsx` *(UPDATED)*
- `src/app/dashboard/quotations/page.tsx` *(UPDATED)*

### 📚 Documentation
- `AUTO_DRAFT_IMPLEMENTATION.md` *(NEW)*
- `QUOTATION_AUTO_DRAFT_FEATURE.md` *(NEW)*
- `deploy-auto-draft.bat` *(NEW)*

### 🗂️ Migration Notes
**Important**: If you deleted existing migrations, create a fresh migration:
```bash
npx prisma migrate dev --name auto_draft_feature
```
This will generate a new migration file with current timestamp.

## Benefits
- **Zero Data Loss**: Users never lose work due to unexpected logouts
- **Seamless Experience**: Automatic recovery without user intervention needed
- **Performance Optimized**: Smart saving prevents unnecessary database operations
- **User-Friendly**: Clear messaging and intuitive recovery process