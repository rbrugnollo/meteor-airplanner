import React from 'react';
import { IconButton, Flex, Text } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

type HeaderProps = {
  onOpen: () => void;
};

const Header = ({ onOpen }: HeaderProps) => (
  <Flex
    ml={{ base: 0, md: 60 }}
    px="4"
    position="sticky"
    top="0"
    height={{ base: 10, md: 20 }}
    zIndex="1"
    alignItems="center"
    bg="teal"
    borderBottomWidth="1px"
    borderBottomColor="gray.200"
    justifyContent="start"
    display={{ base: 'flex', md: 'none' }}
  >
    <IconButton
      display={{ base: 'flex', md: 'none' }}
      onClick={onOpen}
      variant="ghost"
      color="white"
      aria-label="open menu"
      icon={<FiMenu />}
    />
    <Text
      ml={6}
      display={{ base: 'flex', md: 'none' }}
      fontSize="2xl"
      fontFamily="monospace"
      fontWeight="bold"
      color="white"
    >
      Airplanner
    </Text>
  </Flex>
);

export default Header;
