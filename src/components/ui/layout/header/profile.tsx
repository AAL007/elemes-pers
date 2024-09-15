'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { logout } from "@/app/logout/action";
import { Button } from "@nextui-org/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import "@/components/ui/component.css"

import { IconListCheck, IconMail, IconUser } from "@tabler/icons-react";
import { loadUserFromStorage } from "@/lib/user-slice";
import { color } from "framer-motion";

const Profile = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [profilePicture, setProfilePicture] = useState("");
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [isLogout, setIsLogout] = useState(false);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfilePicture = localStorage.getItem("profilePicture");
      if (storedProfilePicture) {
        setProfilePicture(storedProfilePicture);
      }
    }
  }, []);

  return (
    <Box component="div">
      <Button
        aria-label="show 11 new notifications"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        style={{ backgroundColor: "white", width: "100%", height: "50px" }}
        onClick={handleClick2}
      >
        <Avatar
          src={profilePicture}
          alt="image"
          sx={{
            width: 35,
            height: 35,
          }}
        />
        <div>
          <h5 className="profile-name" style={{ color: "black", fontSize: "14px", fontWeight: "600" }}>{userData.name}</h5>
          <h5 className="profile-name" style={{ color: "black", fontSize: "12px", fontWeight: "400" }}>{userData.role}</h5>
        </div>
      </Button>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px",
          },
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText><Link href={'/edit-profile'}>My Profile</Link></ListItemText>
        </MenuItem>
        {/* <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>My Account</ListItemText>
        </MenuItem> */}
        {/* <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem> */}
        <Box component="div" mt={1} py={1} px={2}>
          <Button
            href="#"
            color="danger"
            fullWidth
            onClick={() => {setIsLogout(true); localStorage.removeItem('user'); logout()}}
            isLoading={isLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
