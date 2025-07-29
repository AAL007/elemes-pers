import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button } from '@mui/material';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, cn } from '@nextui-org/react';
import PropTypes from 'prop-types';
import Profile from './profile';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { useEffect, useState } from 'react';
import { fetchAdministratorNotification, fetchLecturerNotification, fetchStudentNotification } from '@/app/api/home/dashboard';
import { useMediaQuery } from '@mui/material';
import { useSidebar } from '../sidebar/sidebar-context';

const Header = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [messages, setMessages] = React.useState<{Message: string, Entity: string}[]>([]);

  let display = {
    lg: 'inline',
    xs: 'inline',
  }

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  useEffect(() => {
    dispatch(loadUserFromStorage())
    console.log(userData.role)
    if(userData.role == "Administrator"){
      const administratorNotification = async () => {
        const res = await fetchAdministratorNotification();
        if(!res.success){
          alert(res.message);
          return;
        }
  
        setMessages(res.data as {Message: string, Entity: string}[]);
      }
  
      administratorNotification();
    }else if(userData.role == "Lecturer"){
      const lecturerNotification = async () => {
        const res = await fetchLecturerNotification(userData.id);
        if(!res.success){
          alert(res.message);
          return;
        }

        console.log(res.data)
  
        setMessages(res.data as {Message: string, Entity: string}[]);
      }
      
      lecturerNotification();
    }else if(userData.role == "Student"){
      console.log(userData.id)
      const studentNotification = async () => {
        const res = await fetchStudentNotification(userData.id);
        if(!res.success){
          alert(res.message);
          return;
        }
  
        setMessages(res.data as {Message: string, Entity: string}[]);
      }
      
      studentNotification();
    }
  }, [userData.id, userData.role]);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={lgUp ? toggleSidebar : toggleMobileSidebar}
          sx={{
            display,
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <Dropdown>
          <DropdownTrigger>
            <IconButton
              size="large"
              aria-label="show 11 new notifications"
              color="inherit"
              aria-controls="msgs-menu"
              aria-haspopup="true"
            >
              <Badge variant={messages.length == 0 ? 'standard' : 'dot'} color="primary">
                <IconBellRinging size="21" stroke="1.5" />
              </Badge>
            </IconButton>
          </DropdownTrigger>
          <DropdownMenu variant="faded" aria-label="Dropdown menu with description">
            {messages.map((message, index) => (
              <DropdownItem
                key={index}
                // shortcut="⌘N"
                showDivider
                description={message.Message}
              >
                {message.Entity}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Box component="div" flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
