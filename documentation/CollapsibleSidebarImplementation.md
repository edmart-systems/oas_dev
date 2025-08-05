// src/components/dashboard/tasks/TaskManager.tsx

📁 Collapsible Sidebar Implementation
This update introduces a collapsible sidebar to enhance usability and screen space efficiency across various screen sizes.

🔄 Overview of Changes
Three main files were updated:

src/components/dashboard/nav-bar/side-nav.tsx

src/components/dashboard/nav-bar/nav-config.tsx

src/components/auth/logout-dialog.tsx

📁 File 1: side-nav.tsx
✅ Key Updates
1. Import Icon
tsx
Copy
Edit
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";
2. Add Collapse State
tsx
Copy
Edit
const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
3. Sidebar Width Style
tsx
Copy
Edit
width: isCollapsed ? "80px" : "var(--SideNav-width)",
transition: "width 0.3s ease",
4. Update Logo Section
tsx
Copy
Edit
<Box sx={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between" }}>
  {!isCollapsed && (
    <Box component={RouterLink} href={paths.home} sx={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-start" }}>
      <Logo color="dark" height={50} width={200} />
    </Box>
  )}
  <IconButton size="small" color="primary" onClick={() => setIsCollapsed((prev) => !prev)}>
    <ListIcon />
  </IconButton>
</Box>
5. Collapse User Info Conditionally
tsx
Copy
Edit
{!isCollapsed && (
  <Box sx={{
    alignItems: "center",
    backgroundColor: mode == "dark" ? "#ffffff1a" : "#0000001a",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    p: "4px 12px",
  }}>
    {/* existing user info content */}
  </Box>
)}
6. Pass Collapse State to renderNavItems
tsx
Copy
Edit
{renderNavItems({
  pathname,
  isAdmin: sessionData?.user.isAdmin == true,
  isCollapsed,
})}
7. Pass Collapse State to LogoutDialog
tsx
Copy
Edit
<LogoutDialog isCollapsed={isCollapsed} />
📁 File 2: nav-config.tsx
✅ Key Updates
1. Import Tooltip
tsx
Copy
Edit
import { Box, Stack, Typography, Tooltip } from "@mui/material";
2. Extend NavItemProps
ts
Copy
Edit
interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  isCollapsed?: boolean;
}
3. Modify NavItem Styles Based on Collapse
tsx
Copy
Edit
gap: isCollapsed ? 0 : 1,
p: isCollapsed ? "6px" : "6px 16px",
justifyContent: isCollapsed ? "center" : "flex-start",
4. Conditional Title Render
tsx
Copy
Edit
{!isCollapsed && (
  <Box sx={{ flex: "1 1 auto" }}>
    <Typography component="span" sx={{
      color: "inherit",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "28px",
    }}>
      {title}
    </Typography>
  </Box>
)}
5. Tooltip on Collapsed Items
tsx
Copy
Edit
return (
  <li>
    {isCollapsed ? (
      <Tooltip title={title} placement="right">
        {navItem}
      </Tooltip>
    ) : (
      navItem
    )}
  </li>
);
6. Update renderNavItems Definition
ts
Copy
Edit
export const renderNavItems = ({
  pathname,
  isAdmin,
  isCollapsed = false,
}: {
  pathname: string;
  isAdmin: boolean | undefined;
  isCollapsed?: boolean;
}): JSX.Element => {
7. Pass isCollapsed to Each NavItem
tsx
Copy
Edit
<NavItem pathname={pathname} {...item} key={key} _key={key} isCollapsed={isCollapsed} />
📁 File 3: logout-dialog.tsx
✅ Key Updates
1. Update Props Type
ts
Copy
Edit
type Props = {
  children?: ReactNode;
  isCollapsed?: boolean;
};
2. Function Signature
tsx
Copy
Edit
const LogoutDialog = ({ children, isCollapsed = false }: Props) => {
3. Render Button or Icon Conditionally
tsx
Copy
Edit
{isCollapsed ? (
  <Tooltip title="Sign Out" placement="right">
    <IconButton
      color="primary"
      onClick={handleClickOpen}
      sx={{ width: "100%", justifyContent: "center" }}
    >
      <SignOut />
    </IconButton>
  </Tooltip>
) : (
  <Button
    variant="outlined"
    startIcon={<SignOut />}
    onClick={handleClickOpen}
  >
    Sign Out
  </Button>
)}