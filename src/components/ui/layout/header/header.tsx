import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button } from '@mui/material';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, cn } from '@nextui-org/react';
import PropTypes from 'prop-types';
import Link from 'next/link';
// components
import Profile from './profile';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';

interface ItemType {
  toggleMobileSidebar:  (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({toggleMobileSidebar}: ItemType) => {

  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));


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
            <DropdownItem
              key="notif1"
              // shortcut="⌘N"
              showDivider
              description="Description 1"
            >
              Notif 1
            </DropdownItem>
            <DropdownItem
              key="notif2"
              // shortcut="⌘C"
              showDivider
              description="Description 2"
            >
              Notif 2
            </DropdownItem>
            <DropdownItem
              key="notif3"
              // shortcut="⌘⇧E"
              showDivider
              description="Description 3"
            >
              Notif 3
            </DropdownItem>
            <DropdownItem
              key="notif4"
              // className="text-danger"
              color="danger"
              // shortcut="⌘⇧D"
              // startContent="🔥"
              description="Description 4"
            >
              Notif 4
            </DropdownItem>
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
