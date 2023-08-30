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
  Spinner,
} from '@chakra-ui/react';
import { AirportsCollection } from '/imports/api/airports/collection';
import { FaPlus } from 'react-icons/fa6';
import { RoleNames } from '/imports/api/users/collection';
import { useSubscribe, useFind } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/airports/publications/list';
import AirportForm from './AirportForm';
import AirportListItem from './AirportListItem';

interface AirportViewModel {
  _id: string;
  name: string;
}

export const AirportListRoles = [RoleNames.ADMIN];

const AirportList = () => {
  const isLoading = useSubscribe(list);
  const airports: AirportViewModel[] = useFind(() => AirportsCollection.find({}));

  if (isLoading())
    return (
      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
    );

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
              Airport
            </Heading>
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <AirportForm
              ActionButton={({ onOpen }) => (
                <Button leftIcon={<FaPlus />} onClick={onOpen} colorScheme="teal">
                  Add New
                </Button>
              )}
            />
          </ButtonGroup>
        </Flex>
        <TableContainer minH="full" whiteSpace="normal">
          <Table size="sm" variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Location</Th>
                <Th>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>
              {airports.map((a) => (
                <AirportListItem key={a._id} airport={a} />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Flex>
  );
};

export default AirportList;
