import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

export const App = () => (
  <>
    <ChakraProvider>
      <Outlet />
    </ChakraProvider>
  </>
);
