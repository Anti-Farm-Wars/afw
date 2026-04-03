

## Plan: Role-Based Permissions & Anti-Screenshot Sync Page

### Overview
Add a "mod" role with limited permissions, update the role system to support granular access, and add anti-screenshot/anti-recording CSS protections to the Sync page.

### 1. Database: Add New Roles to `app_role` Enum

Add `mod` and `view_sync` values to the existing `app_role` enum via migration:
```sql
ALTER TYPE public.app_role ADD VALUE 'mod';
ALTER TYPE public.app_role ADD VALUE 'view_sync';
```

### 2. Role Hierarchy & Permissions

```text
primary_admin  → Full access (create any user, assign any role, all pages)
admin          → Create users, assign roles (except primary_admin), all pages
mod            → View dashboard, manage associations, view sync, NO user management
staff          → View dashboard, manage associations only
view_sync      → Can ONLY view the /sync page (no dashboard access)
```

### 3. Update Staff Dashboard (`StaffDashboard.tsx`)

- **Create User section**: Admin can now assign initial role from dropdown (staff, mod, view_sync). Primary admin can also assign admin.
- **Manage Users section**: Add "mod" and "view_sync" to the role selector dropdown.
- **Mod restrictions**: Mods cannot see the "Staff" tab or create/delete users. They can view and manage associations and types.
- Hide "Sync Update" button from mods (admin/primary_admin only).

### 4. Update Sync Page Access (`WarSync.tsx`)

- Allow access for roles: `view_sync`, `mod`, `admin`, `primary_admin`, `staff`
- Currently requires auth only; add role check to ensure user has at least one valid role.

### 5. Anti-Screenshot / Anti-Recording on Sync Page (`WarSync.tsx`)

Add CSS-based protections to the sync page content:
- Apply `-webkit-filter: blur()` on visibility change (tab switch)
- Use CSS `user-select: none` to prevent text selection
- Add a transparent overlay to interfere with screen capture tools
- Use `document.addEventListener('visibilitychange')` to blur content when tab is not active
- Apply CSS: `filter: blur(0)` normally, blur on capture detection
- Note to user: These are deterrents, not foolproof. Determined users can still capture content.

### 6. Update SyncUpdate Page (`SyncUpdate.tsx`)

- Keep admin/primary_admin only access (already implemented).
- Add mod check: mods cannot access this page.

### Files to Modify
- **Migration**: Add `mod` and `view_sync` to `app_role` enum
- **`src/pages/WarSync.tsx`**: Add anti-screenshot CSS/JS, update role-based access
- **`src/pages/StaffDashboard.tsx`**: Add mod/view_sync to role dropdowns, restrict mod permissions
- **`src/pages/SyncUpdate.tsx`**: No changes needed (already admin-only)

### Technical: Anti-Screenshot Implementation
```css
.sync-protected {
  user-select: none;
  -webkit-user-select: none;
}
.sync-protected.hidden-capture {
  filter: blur(20px);
}
```
```js
// Blur on Print Screen / screenshot attempts
document.addEventListener('keyup', (e) => {
  if (e.key === 'PrintScreen') { /* blur content */ }
});
document.addEventListener('visibilitychange', () => {
  // blur when tab loses focus (screen recording switching)
});
```

