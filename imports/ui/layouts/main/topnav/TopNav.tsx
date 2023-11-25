import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import Notifications from '../Notifications';

const TOP_NAV_HEIGHT = 54;

interface TopNavProps {
  readonly onNavOpen: () => void;
}

export const TopNav = ({ onNavOpen }: TopNavProps) => {
  return (
    <>
      <Box
        component="header"
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: 'neutral.800',
          position: 'sticky',
          display: {
            lg: 'none',
          },
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{
            minHeight: TOP_NAV_HEIGHT,
            px: 2,
          }}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            <IconButton onClick={onNavOpen}>
              <FiMenu color="white" />
            </IconButton>
            <Typography color="white" fontWeight="bold" variant="h5">
              Airplanner
            </Typography>
          </Stack>
          <Notifications />
        </Stack>
      </Box>
    </>
  );
};

export default TopNav;
