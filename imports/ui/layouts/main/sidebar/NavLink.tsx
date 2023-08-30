import React from 'react';
import { Flex, Icon, Text } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { Link } from 'react-router-dom';

export interface Link {
  label: string;
  href: string;
  icon: IconType;
  roles?: string[];
}

export interface NavLinkProps {
  link: Link;
}

const NavLink = ({ link }: NavLinkProps) => (
  <Link to={link.href}>
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      color="white"
      _hover={{
        bg: 'teal.400',
        color: 'white',
      }}
    >
      {link.icon && (
        <Icon
          mr="4"
          fontSize="16"
          _groupHover={{
            color: 'white',
          }}
          as={link.icon}
        />
      )}
      <Text fontSize="1.2rem">{link.label}</Text>
    </Flex>
  </Link>
);

export default NavLink;
