import React from 'react';
import { Skeleton, Box, Divider, Drawer, Stack, useMediaQuery, Theme } from '@mui/material';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import links from './links';
import SideNavItem from './SideNavItem';
import UserProfile from './UserProfile';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

interface SideNavProps {
  readonly onClose: () => void;
  readonly open: boolean;
}

const SideNav = (props: SideNavProps) => {
  const { open, onClose } = props;
  const { isLoadingLoggedUser } = useLoggedUser();
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 3 }}>
        <img style={{ maxWidth: 128, height: '100%' }} src="/logo.png" />
      </Box>
      <Divider sx={{ borderColor: 'neutral.700' }} />
      <Box
        component="nav"
        sx={{
          flexGrow: 1,
          px: 2,
          py: 3,
        }}
      >
        <Stack
          component="ul"
          spacing={0.5}
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
          }}
        >
          {isLoadingLoggedUser
            ? links.map((_link, i) => <Skeleton key={i} />)
            : links
                .filter((f) => !f.permission || hasPermission({ permission: f.permission }))
                .map((link, i) => <SideNavItem key={i} link={link} />)}
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'neutral.700' }} />
      <Box
        sx={{
          px: 2,
          py: 3,
        }}
      >
        <UserProfile />
      </Box>
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.800',
            color: 'common.white',
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.800',
          color: 'common.white',
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

export default SideNav;
