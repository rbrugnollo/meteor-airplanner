import React from 'react';
import { IconButton, Flex, Text } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import UserProfile from './UserProfile';

type HeaderProps = {
  onOpen: () => void;
};

const Header = ({ onOpen }: HeaderProps) => (
  <Flex
    ml={{ base: 0, md: 60 }}
    px="4"
    position="sticky"
    top="0"
    height="20"
    zIndex="1"
    alignItems="center"
    bg="white"
    borderBottomWidth="1px"
    borderBottomColor="gray.200"
    justifyContent={{ base: 'space-between', md: 'flex-end' }}
  >
    <IconButton
      display={{ base: 'flex', md: 'none' }}
      onClick={onOpen}
      variant="outline"
      aria-label="open menu"
      icon={<FiMenu />}
    />
    <Text
      display={{ base: 'flex', md: 'none' }}
      fontSize="2xl"
      fontFamily="monospace"
      fontWeight="bold"
    >
      Airplanner
    </Text>
    <UserProfile />
  </Flex>
);

export default Header;