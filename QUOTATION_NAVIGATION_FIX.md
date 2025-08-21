# Quotation Table Navigation State Preservation

## Overview
This implementation fixes the quotation table navigation behavior to preserve table state, filters, and scroll position when users navigate between quotation details and the main table.

## Problem Solved
- When users click on a quotation row to open details and then click "Back", they now return to the exact table page and scroll position where they left off
- Applied filters are preserved when navigating to quotation details and back
- Works for both main quotations and variant/edited quotations

## Implementation Details

### New Files Created
1. **`src/redux/slices/quotation-table-state.slice.ts`** - Redux slice to manage table state
2. **`src/hooks/use-quotation-navigation.ts`** - Custom hook for navigation with state preservation
3. **`src/utils/scroll-restoration.utils.ts`** - Utilities for reliable scroll position handling

### Modified Files
1. **`src/redux/store.ts`** - Added new slice to Redux store
2. **`src/components/dashboard/quotations/quotations-table-container.tsx`** - Updated to use state management
3. **`src/components/dashboard/quotations/quotation/quotations-table/quotation-row.tsx`** - Updated navigation
4. **`src/components/dashboard/quotations/quotation/quotations-table/variant-quotation-row.tsx`** - Updated navigation
5. **`src/components/dashboard/common/page-go-back.tsx`** - Smart back navigation

### State Management
The Redux store now persists:
- Current page number and offset
- Applied filters
- Scroll position
- Search mode status
- View mode (group/list)

## How to Test

### Test Case 1: Basic Navigation
1. Go to quotations page
2. Navigate to page 2 or 3 of the table
3. Scroll down on the page
4. Click on any quotation to open details
5. Click "Back" button
6. **Expected**: Return to the same page and scroll position

### Test Case 2: Filter Preservation
1. Go to quotations page
2. Apply filters (e.g., filter by client name)
3. Navigate through filtered results to page 2
4. Click on a quotation to open details
5. Click "Back" button
6. **Expected**: Return to filtered results on page 2

### Test Case 3: Variant Navigation
1. Go to quotations page
2. Find a quotation with variants (has expand arrow)
3. Expand the quotation to show variants
4. Click on a variant quotation
5. Click "Back" button
6. **Expected**: Return to main table with preserved state

### Test Case 4: Search Mode
1. Go to quotations page
2. Apply search filters
3. Navigate through search results
4. Open a quotation from search results
5. Click "Back" button
6. **Expected**: Return to search results with filters intact

## Technical Notes

### Scroll Position Restoration
- Uses multiple restoration attempts to handle DOM loading delays
- Combines setTimeout and requestAnimationFrame for reliability
- Automatically saves scroll position during navigation

### Filter Restoration
- Filters are restored from Redux state on component mount
- Search mode is properly maintained
- Pagination state is synchronized with filters

### Performance Considerations
- State is persisted to localStorage via redux-persist
- Scroll position is throttled to avoid excessive updates
- Navigation state is only saved when actually navigating

## Browser Compatibility
- Works in all modern browsers
- Uses standard Web APIs (scrollTo, addEventListener)
- Gracefully handles cases where scroll restoration fails

## Future Enhancements
- Could add animation for smooth scroll restoration
- Could implement state cleanup after extended periods
- Could add user preference for enabling/disabling this feature