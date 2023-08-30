import React, { useEffect } from 'react';
import Header from './header/Header';
import Sidebar from './sidebar/Sidebar';
import { Box, Drawer, DrawerContent, Spinner, useDisclosure } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { roles } from '/imports/api/users/publications/roles';
import { useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';

const MainLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isLoading = useSubscribe(roles);

  // Automatically closes when location changes
  const location = useLocation();
  useEffect(() => {
    onClose();
  }, [location]);

  if (isLoading()) return <Spinner />;
  return (
    <Box minH="100vh" bg="white">
      <Sidebar onClose={onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Header */}
      <Header onOpen={onOpen} />
      <Box h="full" bg="white" ml={{ base: 0, md: 60 }} p={0}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
