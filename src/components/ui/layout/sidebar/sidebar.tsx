import { useMediaQuery, Box, Drawer } from "@mui/material";
import Logo from "../shared/logo/logo";
import SidebarItems from "./sidebar-items";
import { useEffect, useState } from "react";
import { set } from "lodash";
// import { Upgrade } from "./Upgrade";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {

  // const [isCourseListPage, setIsCourseListPage] = useState(false);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  // useEffect(() => {
  //   const isCourseListPage = window.location.pathname.includes("course/course-list");
  //   setIsCourseListPage(isCourseListPage);
  // }, [lgUp, isCourseListPage]);
  
  const sidebarWidth = "270px";

  if (lgUp) {//&& !isCourseListPage) {
    return (
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
          variant="permanent"
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
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
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
