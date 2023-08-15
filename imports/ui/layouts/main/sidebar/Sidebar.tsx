import React, { useEffect } from "react";
import { Property } from "csstype";
import { Box, CloseButton, Flex, Text } from "@chakra-ui/react";
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
} from "react-icons/fi";
import NavLink, { Link } from "./NavLink";
import { Token } from "@chakra-ui/styled-system/dist/declarations/src/utils";

const LinkItems: Link[] = [
  { label: "Home", icon: FiHome, href: "/" },
  { label: "Trending", icon: FiTrendingUp, href: "/" },
  { label: "Explore", icon: FiCompass, href: "/" },
  { label: "Favourites", icon: FiStar, href: "/" },
  { label: "Settings", icon: FiSettings, href: "/" },
];

interface SidebarProps {
  onClose: () => void;
  display?: Token<Property.Display>;
}

const Sidebar = ({ onClose, display }: SidebarProps) => (
  <Box
    transition="3s ease"
    bg="white"
    borderRight="1px"
    borderRightColor="gray.200"
    w={{ base: "full", md: 60 }}
    pos="fixed"
    h="full"
    display={display}
  >
    <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
      <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
        Airplanner
      </Text>
      <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
    </Flex>
    {LinkItems.map((link, i) => (
      <NavLink key={i} link={link} />
    ))}
  </Box>
);

export default Sidebar;
