# Auto-Draft Feature Implementation

## Overview
This implementation adds an auto-draft feature to the Quotation module that automatically saves user progress when they are logged out due to inactivity, and provides a recovery option on the next login.

## Features Implemented

### 1. Database Schema Updates
- **Migration**: `20250122000000_auto_draft_feature/migration.sql`
- **Schema Changes**: Added metadata fields to `quotation_draft` table:
  - `draft_type` ENUM('manual', 'auto') - Distinguishes between manual and auto-drafts
  - `created_at` DATETIME(3) - Timestamp when draft was created
  - `updated_at` DATETIME(3) - Timestamp when draft was last updated
  - Index on `userId`, `draft_type`, `updated_at` for efficient queries

### 2. Backend Services

#### Repository Layer (`quotations.repository.ts`)
- `recordAutoDraft()` - Saves auto-draft, overwriting existing auto-drafts for the user
- `fetchLatestAutoDraft()` - Retrieves the most recent auto-draft for a user
- `deleteAutoDraft()` - Removes auto-drafts for a user
- Updated existing methods to handle draft types properly

#### Service Layer (`quotations.service.ts`)
- `saveAutoDraft()` - Business logic for saving auto-drafts
- `getLatestAutoDraft()` - Business logic for retrieving auto-drafts
- `deleteAutoDraft()` - Business logic for deleting auto-drafts

### 3. API Endpoints
- **POST** `/api/quotations/auto-draft` - Save auto-draft
- **GET** `/api/quotations/auto-draft?userId={id}` - Get latest auto-draft
- **DELETE** `/api/quotations/auto-draft` - Delete auto-draft

### 4. Frontend Components

#### Auto-Draft Recovery Dialog (`auto-draft-recovery-dialog.tsx`)
- Shows when user has an existing auto-draft on login
- Displays draft timestamp and basic details
- Options to restore or discard the draft
- Non-intrusive design matching project theme

#### Client API Functions (`auto-draft-api.ts`)
- `saveAutoDraftHandler()` - Client-side auto-draft saving
- `getLatestAutoDraftHandler()` - Client-side auto-draft retrieval
- `deleteAutoDraftHandler()` - Client-side auto-draft deletion

### 5. Activity Monitor Integration (`ui-activity-monitor.tsx`)
- Modified to trigger auto-save before logout due to inactivity
- Dispatches custom event `triggerAutoSave` before signing out
- Includes small delay to allow auto-save to complete

### 6. Quotation Form Updates

#### Create Quotation (`create-quotation.tsx`)
- Added informational message: "Your progress will be saved automatically as a draft if you are logged out before submitting."
- Auto-save functionality triggered by activity monitor
- Auto-draft recovery dialog on component mount
- Tracks unsaved changes to optimize auto-save calls
- Clears auto-draft after successful quotation submission

#### Edit Quotation (`edit-quotation.tsx`)
- Same auto-save and informational message features
- Adapted for edit quotation workflow

## Key Design Decisions

### 1. Database Design
- **Single auto-draft per user**: Prevents database clutter by overwriting existing auto-drafts
- **Separate draft types**: Maintains existing manual draft functionality while adding auto-drafts
- **Metadata tracking**: Enables showing meaningful information to users about their auto-drafts

### 2. Auto-Save Triggers
- **Inactivity logout**: Primary trigger when user is about to be logged out
- **Content validation**: Only saves if there's meaningful content (client name or line items)
- **Change tracking**: Optimizes performance by only saving when there are actual changes

### 3. User Experience
- **Non-intrusive messaging**: Clear but not overwhelming information about auto-save
- **Recovery prompt**: Appears only when relevant (user has auto-draft)
- **Seamless integration**: Works with existing manual draft functionality

### 4. Data Management
- **Auto-cleanup**: Auto-drafts are automatically removed after successful submission
- **Overwrite strategy**: New auto-drafts replace old ones to prevent accumulation
- **Separate from manual drafts**: Manual draft limits and functionality remain unchanged

## Usage Flow

1. **User starts creating/editing quotation**
   - Informational message displayed about auto-save
   - System tracks changes to form

2. **User becomes inactive**
   - Activity monitor detects inactivity timeout
   - Triggers auto-save if there are unsaved changes with content
   - User is logged out

3. **User logs back in**
   - System checks for existing auto-draft
   - If found, shows recovery dialog with timestamp
   - User can choose to restore or discard

4. **User completes quotation**
   - Auto-draft is automatically deleted after successful submission
   - Manual drafts remain unaffected

## Technical Notes

### Error Handling
- All auto-draft operations are wrapped in try-catch blocks
- Failures in auto-draft functionality don't affect main quotation workflow
- Console logging for debugging auto-draft issues

### Performance Considerations
- Auto-save only triggers when there are actual changes
- Database queries optimized with proper indexing
- Minimal impact on existing quotation functionality

### Security
- All auto-draft operations require valid user session
- User can only access their own auto-drafts
- Standard authentication and authorization apply

## Files Modified/Created

### Database
- `prisma/migrations/20250122000000_auto_draft_feature/migration.sql`
- `prisma/schema.prisma`

### Backend
- `src/services/quotations-service/quotations.repository.ts`
- `src/services/quotations-service/quotations.service.ts`
- `src/app/api/quotations/auto-draft/route.ts`
- `src/types/quotations.types.ts`

### Frontend
- `src/components/dashboard/quotations/auto-draft-api.ts`
- `src/components/dashboard/quotations/auto-draft-recovery-dialog.tsx`
- `src/components/auth/ui-activity-monitor.tsx`
- `src/components/dashboard/quotations/create-quotation/create-quotation.tsx`
- `src/components/dashboard/quotations/create-quotation/edit-quotation/edit-quotation.tsx`

### Documentation
- `AUTO_DRAFT_IMPLEMENTATION.md`

## Next Steps

1. **Run Database Migration**: Execute the migration to apply schema changes
2. **Test Implementation**: Verify auto-draft functionality works as expected
3. **Monitor Performance**: Ensure auto-save doesn't impact user experience
4. **User Feedback**: Gather feedback on the auto-draft recovery experience

## Maintenance Notes

- Auto-drafts are automatically cleaned up, but periodic cleanup jobs could be added
- Monitor auto-draft table size and performance
- Consider adding configuration for auto-save frequency if needed
- Review and update auto-draft retention policies as needed