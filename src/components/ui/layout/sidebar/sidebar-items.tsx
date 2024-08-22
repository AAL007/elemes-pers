import React, { useEffect } from "react";
import Menuitems from "./menu-items";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./nav-item";
import NavGroup from "./nav-group/nav-group";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromStorage } from "@/lib/user-slice";
import { RootState } from "@/lib/store";

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const pathDirect = pathname;

  useEffect(() => {
    Menuitems.filter(x => x.roles?.includes(userData.role));
    dispatch(loadUserFromStorage());
  }, [dispatch])
  
  return (
    <Box component="div" sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {Menuitems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            if(item.roles?.includes(userData.role.toLowerCase())){
              return <NavGroup item={item} key={item.subheader} />;
            }
            
            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            if(item.roles?.includes(userData.role.toLowerCase())){
              return (
                <NavItem
                  item={item}
                  key={item.id}
                  pathDirect={pathDirect}
                  onClick={toggleMobileSidebar}
                />
              );
            }
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
