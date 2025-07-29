import { useMediaQuery, Box, Drawer } from "@mui/material";
import Logo from "../shared/logo/logo";
import SidebarItems from "./sidebar-items";
import { useSidebar } from "./sidebar-context";

const Sidebar = () => {
  const { isSidebarOpen, isMobileSidebarOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  // const [isCourseListPage, setIsCourseListPage] = useState(false);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  
  const sidebarWidth = "270px";

  if (lgUp) {//&& !isCourseListPage) {
    return (
      <>
        {isSidebarOpen && (
          <Box
            component="div"
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
            }}
          >
            {/* ------------------------------------------- */}
            {/* Sidebar for desktop */}
            {/* ------------------------------------------- */}
            <Drawer
              anchor="left"
              open={isSidebarOpen}
              onClose={toggleSidebar}
              variant="temporary"
              PaperProps={{
                sx: {
                  width: sidebarWidth,
                  boxSizing: "border-box",
                },
              }}
            >
              {/* ------------------------------------------- */}
              {/* Sidebar Box */}
              {/* ------------------------------------------- */}
              <Box
                component="div"
                sx={{
                  height: "100%",
                }}
              >
                {/* ------------------------------------------- */}
                {/* Logo */}
                {/* ------------------------------------------- */}
                <Box component="div" px={3}>
                  <Logo />
                </Box>
                <Box component="div">
                  {/* ------------------------------------------- */}
                  {/* Sidebar Items */}
                  {/* ------------------------------------------- */}
                  <SidebarItems />
                  {/* <Upgrade /> */}
                </Box>
              </Box>
            </Drawer>
          </Box>
        )}
      </>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={toggleMobileSidebar}
      variant="temporary"
      PaperProps={{
        sx: {
          width: sidebarWidth,
          boxShadow: (theme: any) => theme.shadows[8],
        },
      }}
    >
      {/* ------------------------------------------- */}
      {/* Logo */}
      {/* ------------------------------------------- */}
      <Box component="div" px={2}>
        <Logo />
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
      <SidebarItems />
      {/* <Upgrade /> */}
    </Drawer>
  );
};

export default Sidebar;
