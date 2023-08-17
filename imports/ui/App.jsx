import React from "react";
import MainLayout from "./layouts/main/MainLayout";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const theme = extendTheme({});

export const App = () => {
  return (
    <>
      <ChakraProvider theme={theme}>
          <Outlet />
      </ChakraProvider>
    </>
  );
};
