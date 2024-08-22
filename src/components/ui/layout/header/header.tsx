import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button } from '@mui/material';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, cn } from '@nextui-org/react';
import PropTypes from 'prop-types';
import Link from 'next/link';
// components
import Profile from './profile';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import { useEffect } from 'react';
import { fetchAdministratorNotification } from '@/app/api/home/dashboard';

interface ItemType {
  toggleMobileSidebar:  (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({toggleMobileSidebar}: ItemType) => {

  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [messages, setMessages] = React.useState<{message: string, category: string}[]>([]);

  useEffect(() => {
    dispatch(loadUserFromStorage())
    const administratorNotification = async () => {
      const res = await fetchAdministratorNotification();
      if(!res.success){
        // console.log(res.message);
        alert(res.message);
        return;
      }
      const filteredData = res.data.filter(item => item != "");
      // console.log(filteredData);
      setMessages(filteredData as {message: string, category: string}[]);
    }

    administratorNotification();
  }, [dispatch])

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
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
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
              <Badge variant="dot" color="primary">
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
                description={message.message}
              >
                {message.category}
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
