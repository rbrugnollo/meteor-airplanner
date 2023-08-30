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
import { FaPlus } from 'react-icons/fa6';
import { RoleNames } from '/imports/api/users/collection';
import FlightForm from './FlightForm';

export const FlightScheduleListRoles = [RoleNames.ADMIN];

const FlightScheduleList = () => {
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
              Flight Schedule
            </Heading>
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <FlightForm
              ActionButton={({ onOpen }) => (
                <Button leftIcon={<FaPlus />} onClick={onOpen} colorScheme="teal">
                  Add New
                </Button>
              )}
            />
          </ButtonGroup>
        </Flex>
        <SkeletonText noOfLines={6} spacing={4} skeletonHeight={10} isLoaded={true}>
          <TableContainer minH="full" whiteSpace="normal">
            <Table size="sm" variant="striped" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Tail Number</Th>
                  <Th>&nbsp;</Th>
                </Tr>
              </Thead>
              <Tbody>{null}</Tbody>
            </Table>
          </TableContainer>
        </SkeletonText>
      </Box>
    </Flex>
  );
};

export default FlightScheduleList;
