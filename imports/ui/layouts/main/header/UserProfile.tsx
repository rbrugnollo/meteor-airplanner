import React from 'react';
import {
  IconButton,
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Menu,
  MenuButton,
  Icon,
  MenuItem,
  MenuList,
  Spinner,
} from '@chakra-ui/react';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { FiChevronDown, FiBell, FiLogOut } from 'react-icons/fi';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router';

const UserProfile = () => {
  const navigate = useNavigate();
  const { loggedUser, isLoadingLoggedUser } = useLoggedUser();

  const logOut = () => {
    Meteor.logout(() => {
      navigate('/login');
    });
  };

  if (isLoadingLoggedUser) {
    return <Spinner />;
  }

  return (
    <HStack spacing={{ base: '0', md: '6' }}>
      <IconButton size="lg" variant="ghost" aria-label="open menu" icon={<FiBell />} />
      <Flex alignItems="center">
        <Menu>
          <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
            <HStack spacing="4">
              <VStack
                display={{ base: 'none', md: 'flex' }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >
                <Text fontSize="lg">{loggedUser?.profile?.name}</Text>
                <Text fontSize="md" color="gray.600">
                  {loggedUser?.username}
                </Text>
              </VStack>
              <Box display={{ base: 'none', md: 'flex' }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList fontSize="lg" bg="white" borderColor="gray.200">
            <MenuItem icon={<Icon as={FiLogOut} />} onClick={logOut}>
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </HStack>
  );
};

export default UserProfile;
