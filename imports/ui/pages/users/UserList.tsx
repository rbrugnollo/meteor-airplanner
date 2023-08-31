import React from 'react';
import {
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Flex,
  Box,
  Heading,
  Spacer,
  ButtonGroup,
  Button,
  SkeletonText,
} from '@chakra-ui/react';
import UserListItem from './UserListItem';
import UserForm from './UserForm';
import { FaPlus } from 'react-icons/fa6';
import { Meteor } from 'meteor/meteor';
import { RoleNames } from '/imports/api/users/collection';
import { list } from '/imports/api/users/publications/list';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';

interface UserViewModel {
  readonly _id: string;
  readonly username?: string;
  readonly profile?: {
    readonly name?: string;
    readonly roles?: string[];
  };
}

export const UserListRoles = [RoleNames.ADMIN];

const UserList = () => {
  const isLoading = useSubscribe(list);
  const users: UserViewModel[] = useFind(() => Meteor.users.find());

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={{ base: 4, md: 8 }}
        width="full"
        h="full"
        minH={{
          base: 'calc(100vh - 2rem)',
          md: '100vh',
        }}
        bgColor="white"
      >
        <Flex minWidth="max-content" alignItems="center" gap="2" mb={6}>
          <Box>
            <Heading as="h3" size="lg">
              Users
            </Heading>
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <UserForm
              ActionButton={({ onOpen }) => (
                <Button leftIcon={<FaPlus />} onClick={onOpen} colorScheme="teal">
                  Add New
                </Button>
              )}
            />
          </ButtonGroup>
        </Flex>
        <SkeletonText noOfLines={6} spacing={4} skeletonHeight={10} isLoaded={!isLoading()}>
          <TableContainer minH="full" whiteSpace="normal">
            <Table size="sm" variant="striped" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Roles</Th>
                  <Th>&nbsp;</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((a) => (
                  <UserListItem key={a._id} user={a} />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </SkeletonText>
      </Box>
    </Flex>
  );
};

export default UserList;
