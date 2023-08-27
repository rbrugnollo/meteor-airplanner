import React from 'react';
import { Property } from 'csstype';
import { Box, CloseButton, Flex, Text, Spinner } from '@chakra-ui/react';
import { FaHouse, FaPlane, FaUsers, FaCalendarDays, FaGear } from 'react-icons/fa6';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import NavLink, { Link } from './NavLink';
import { ResponsiveValue } from '@chakra-ui/styled-system/dist';
import { Roles } from 'meteor/alanning:roles';
import { AirplaneListRoles } from '/imports/ui/pages/airplanes/AirplaneList';
import { UserListRoles } from '/imports/ui/pages/users/UserList';

const LinkItems: Link[] = [
  { label: 'Home', icon: FaHouse, href: '/app' },
  { label: 'Schedule', icon: FaCalendarDays, href: 'schedule' },
  {
    label: 'Airplanes',
    icon: FaPlane,
    href: 'airplanes',
    roles: AirplaneListRoles,
  },
  { label: 'Users', icon: FaUsers, href: 'users', roles: UserListRoles },
  { label: 'Settings', icon: FaGear, href: 'settings' },
];

interface SidebarProps {
  onClose: () => void;
  display?: ResponsiveValue<Property.Display>;
}

const Sidebar = ({ onClose, display }: SidebarProps) => {
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();

  return (
    <Box
      transition="3s ease"
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      display={display}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Airplanner
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {isLoadingLoggedUser ? (
        <Spinner />
      ) : (
        LinkItems.filter((f) => !f.roles || Roles.userIsInRole(loggedUser._id, f.roles)).map(
          (link, i) => <NavLink key={i} link={link} />,
        )
      )}
    </Box>
  );
};
export default Sidebar;
