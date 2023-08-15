import React from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";

export interface Link {
  label: string;
  href: string;
  icon: IconType;
}

export interface NavLinkProps {
  link: Link;
}

const NavLink = ({ link }: NavLinkProps) => (
  <a>
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      _hover={{
        bg: "cyan.400",
        color: "white",
      }}
    >
      {link.icon && (
        <Icon
          mr="4"
          fontSize="16"
          _groupHover={{
            color: "white",
          }}
          as={link.icon}
        />
      )}
      <Text fontSize="1.2rem">{link.label}</Text>
    </Flex>
  </a>
);

export default NavLink;
