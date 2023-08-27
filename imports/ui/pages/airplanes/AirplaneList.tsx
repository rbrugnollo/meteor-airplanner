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
import { AirplanesCollection } from '/imports/api/airplanes/collection';
import AirplaneListItem from './AirplaneListItem';
import AirplaneForm from './AirplaneForm';
import { FaPlus } from 'react-icons/fa6';
import { RoleNames } from '/imports/api/users/collection';
import { useSubscribe, useFind } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/airplanes/publications/list';

interface AirplaneViewModel {
  _id: string;
  name: string;
  tailNumber: string;
}

export const AirplaneListRoles = [RoleNames.ADMIN];

const AirplaneList = () => {
  const isLoading = useSubscribe(list);
  const airplanes: AirplaneViewModel[] = useFind(() => AirplanesCollection.find({}));

  if (isLoading())
    return (
      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
    );

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={{ base: 4, md: 8 }}
        width="full"
        minH={{
          base: 'calc(100vh - 6rem)',
          md: 'calc(100vh - 7rem)',
        }}
        borderWidth={1}
        borderRadius={8}
        bgColor="white"
      >
        <Flex minWidth="max-content" alignItems="center" gap="2" mb={3}>
          <Box>
            <Heading as="h3" size="lg">
              Airplanes
            </Heading>
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <AirplaneForm
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
                <Th>Tail Number</Th>
                <Th>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>
              {airplanes.map((a) => (
                <AirplaneListItem key={a._id} airplane={a} />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Flex>
  );
};

export default AirplaneList;
