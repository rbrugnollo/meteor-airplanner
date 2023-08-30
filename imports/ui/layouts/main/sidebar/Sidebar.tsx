import React from 'react';
import { Property } from 'csstype';
import { Box, CloseButton, Flex, Text, SkeletonText } from '@chakra-ui/react';
import {
  FaHouse,
  FaPlane,
  FaUsers,
  FaCalendarDays,
  FaGear,
  FaMoneyBillTransfer,
} from 'react-icons/fa6';
import { CiAirportSign1 } from 'react-icons/ci';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import NavLink, { Link } from './NavLink';
import { ResponsiveValue } from '@chakra-ui/styled-system/dist';
import { Roles } from 'meteor/alanning:roles';
import { AirplaneListRoles } from '/imports/ui/pages/airplanes/AirplaneList';
import { UserListRoles } from '/imports/ui/pages/users/UserList';
import { CostCenterListRoles } from '/imports/ui/pages/costCenters/CostCenterList';
import { AirportListRoles } from '/imports/ui/pages/airports/AirportList';
import UserProfile from '../header/UserProfile';

const LinkItems: Link[] = [
  { label: 'Home', icon: FaHouse, href: '/app' },
  { label: 'Flight Schedule', icon: FaCalendarDays, href: 'flightSchedule' },
  {
    label: 'Airplanes',
    icon: FaPlane,
    href: 'airplanes',
    roles: AirplaneListRoles,
  },
  {
    label: 'Airports',
    icon: CiAirportSign1,
    href: 'airports',
    roles: AirportListRoles,
  },
  { label: 'Users', icon: FaUsers, href: 'users', roles: UserListRoles },
  {
    label: 'Cost Centers',
    icon: FaMoneyBillTransfer,
    href: 'costCenters',
    roles: CostCenterListRoles,
  },
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
      bg="teal"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      display={display}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" color="white" fontFamily="monospace" fontWeight="bold">
          Airplanner
        </Text>
        <CloseButton color="white" display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <SkeletonText noOfLines={6} spacing={4} skeletonHeight={8} isLoaded={!isLoadingLoggedUser}>
        <Box mt={30}>
          {LinkItems.filter((f) => !f.roles || Roles.userIsInRole(loggedUser._id, f.roles)).map(
            (link, i) => (
              <NavLink key={i} link={link} />
            ),
          )}
        </Box>
        <Box position="absolute" bottom="0" w="full" mb={5}>
          <UserProfile />
        </Box>
      </SkeletonText>
    </Box>
  );
};
export default Sidebar;
