import React from 'react';
import {
  Box,
  Text,
  Icon,
  Spinner,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Divider,
} from '@chakra-ui/react';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { FiLogOut } from 'react-icons/fi';
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
    <>
      <Accordion allowToggle borderTop="0px" borderBottom="0px">
        <AccordionItem borderTop="0px" borderBottom="0px">
          <AccordionButton
            _hover={{
              bg: 'transparent',
            }}
          >
            <Box as="span" flex="1" textAlign="left">
              <Text fontSize="md" color="gray.50">
                {loggedUser?.profile?.name}
              </Text>
              <Text fontSize="sm" color="gray.100">
                {loggedUser?.username}
              </Text>
            </Box>
            <AccordionIcon color="white" />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Divider />
            <Button
              leftIcon={<Icon as={FiLogOut} />}
              onClick={logOut}
              color="white"
              variant="ghost"
              fontWeight="normal"
            >
              Sign out
            </Button>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default UserProfile;
