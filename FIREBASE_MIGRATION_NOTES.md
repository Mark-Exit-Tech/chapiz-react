# Firebase Migration Notes

## User Property Changes

### Supabase User → Firebase User Mapping

| Supabase Property | Firebase Property | Notes |
|-------------------|-------------------|-------|
| `user.id` | `user.uid` | Unique user ID |
| `user.user_metadata.full_name` | `user.displayName` or `dbUser.full_name` | Use dbUser for custom fields |
| `user.user_metadata.phone` | `dbUser.phone` | Stored in Firestore |
| `user.user_metadata.address` | `dbUser.address` | Stored in Firestore |
| `user.profile_image` | `user.photoURL` or `dbUser.profile_image` | Profile picture URL |

## Quick Find & Replace Guide

Run these in your codebase:

```bash
# Replace user.id with user.uid
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/user\.id/user.uid/g' {} \;

# Replace user?.id with user?.uid  
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/user\?\.id/user?.uid/g' {} \;

# Replace user.user_metadata with dbUser
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/user\.user_metadata/dbUser/g' {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/user\?\.user_metadata/dbUser/g' {} \;
```

## Components That Need Manual Updates

1. **UserSettingsPage.tsx** - Replace `user_metadata` with `dbUser`  
2. **ContactPage.tsx** - Use `dbUser` for phone/address
3. **UserCouponsPage.tsx** - Change `user.id` to `user.uid`

## AuthContext Differences

### Supabase AuthContext
```typescript
const { user } = useAuth(); // user.id, user.user_metadata
```

### Firebase AuthContext  
```typescript
const { user, dbUser } = useAuth(); 
// user.uid - Firebase auth user
// dbUser.full_name, dbUser.phone - Firestore user data
```

## Missing Functions in Firebase Context

These functions from Supabase aren't implemented yet:
- `sendDeletionVerificationCode`
- `verifyCodeAndCreateAccount`
- `completeGoogleProfile`
- `getStoredOTPCode`

Add them if needed!
