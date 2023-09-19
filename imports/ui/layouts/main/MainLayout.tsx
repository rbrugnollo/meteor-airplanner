import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Outlet, useLocation } from 'react-router-dom';
import { roles } from '/imports/api/users/publications/roles';
import { useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import LoadingSpinner from './Loading';
import SideNav from './sidenav/SideNav';
import TopNav from './topnav/TopNav';

const SIDE_NAV_WIDTH = 280;

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  [theme.breakpoints.up('lg')]: {
    paddingLeft: SIDE_NAV_WIDTH,
  },
}));

const LayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
});

const MainLayout = () => {
  const [openNav, setOpenNav] = useState(false);
  const isLoading = useSubscribe(roles);

  // Automatically closes when location changes
  const location = useLocation();
  useEffect(() => {
    setOpenNav(false);
  }, [location]);

  if (isLoading()) return <LoadingSpinner />;

  return (
    <>
      <TopNav onNavOpen={() => setOpenNav(true)} />
      <SideNav onClose={() => setOpenNav(false)} open={openNav} />
      <LayoutRoot>
        <LayoutContainer>
          <Outlet />
        </LayoutContainer>
      </LayoutRoot>
    </>
  );
};

export default MainLayout;
