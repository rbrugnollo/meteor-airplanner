import React from "react";
import MainLayout from "./layouts/main/MainLayout";
import { ChakraProvider, extendTheme, Heading } from "@chakra-ui/react";

const theme = extendTheme({});

export const App = () => {
  return (
    <>
      <ChakraProvider theme={theme}>
        <MainLayout>
          <Heading as="h1">Welcome to Meteor!</Heading>
        </MainLayout>
      </ChakraProvider>
    </>
  );
};
