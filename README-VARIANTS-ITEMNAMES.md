# Variant Background Colors & Long Item Names

## Overview
This document covers two key UI enhancements: visual differentiation for variant quotation rows and extended item name field capacity.

## Variant Background Colors

### Purpose
Provides visual distinction between main quotation rows and variant rows for better user experience.

### Implementation
- **File**: `src/components/dashboard/quotations/quotation/quotations-table/variant-quotation-row.tsx`
- **Light Mode**: Light green background (`#e8f5e8`)
- **Dark Mode**: Blue-grey background (`#2c3e50`)

### Code Changes
```tsx
sx={{
  backgroundColor: theme.palette.mode === 'light' ? '#e8f5e8' : '#2c3e50'
}}
```

## Long Item Names

### Purpose
Allows quotation items to have descriptive names up to 255 characters instead of the previous 30-character limit.

### Implementation
- **Validation Files**:
  - `src/components/dashboard/quotations/create-quotation/create-quotation-methods.ts`
  - `src/services/quotations-service/create-quotation.ts`

### Code Changes
```typescript
// Before
if (item.name.length > 30) {
  return { success: false, message: "Item name cannot exceed 30 characters" };
}

// After  
if (item.name.length > 255) {
  return { success: false, message: "Item name cannot exceed 255 characters" };
}
```

### Field Limits
- **Item Names**: 255 characters (increased)
- **Other Fields**: 30 characters (unchanged)
  - Item codes
  - Units
  - Descriptions

## Testing Checklist

### Variant Colors
- [ ] Variant rows display different background in light mode
- [ ] Variant rows display different background in dark mode
- [ ] Colors remain consistent across theme switches

### Item Names
- [ ] Can enter item names up to 255 characters
- [ ] Validation prevents names over 255 characters
- [ ] Other fields still limited to 30 characters
- [ ] Both client and server validation work correctly