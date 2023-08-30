import React from 'react';
import { Center, Spinner, VStack, Text } from '@chakra-ui/react';

const LoadingSpinner = () => {
  return (
    <Center h="100vh" w="100vw">
      <VStack spacing="24px">
        <Spinner
          thickness="16px"
          speed="0.65s"
          emptyColor="gray.200"
          color="teal.500"
          height={150}
          width={150}
        />
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Airplanner is loading...
        </Text>
      </VStack>
    </Center>
  );
};

export default LoadingSpinner;
