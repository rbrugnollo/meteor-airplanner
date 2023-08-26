import React, { useEffect } from "react";
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import { Box, Drawer, DrawerContent, useDisclosure } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Automatically closes when location changes
  const location = useLocation();
  useEffect(() => {
    onClose();
  }, [location]);

  return (
    <Box minH="100vh" bg="gray.100">
      <Sidebar onClose={onClose} display={{ base: "none", md: "block" }} />
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
      <Box ml={{ base: 0, md: 60 }} p={{ base: 2, md: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
