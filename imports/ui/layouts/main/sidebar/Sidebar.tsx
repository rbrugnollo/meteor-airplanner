import React from "react";
import { Property } from "csstype";
import { Box, CloseButton, Flex, Text } from "@chakra-ui/react";
import {
  FaHouse,
  FaPlane,
  FaUsers,
  FaUserTie,
  FaCalendarDays,
  FaGear,
} from "react-icons/fa6";
import NavLink, { Link } from "./NavLink";
import { Token } from "@chakra-ui/styled-system/dist/declarations/src/utils";

const LinkItems: Link[] = [
  { label: "Home", icon: FaHouse, href: "/app" },
  { label: "Schedule", icon: FaCalendarDays, href: "schedule" },
  { label: "Airplanes", icon: FaPlane, href: "airplanes" },
  { label: "Pilots", icon: FaUserTie, href: "pilots" },
  { label: "Passengers", icon: FaUsers, href: "passengers" },
  { label: "Settings", icon: FaGear, href: "settings" },
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
