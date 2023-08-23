import React from "react";
import MainLayout from "./layouts/main/MainLayout";
import { ChakraProvider } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export const App = () => {
  return (
    <>
      <ChakraProvider>
        <Outlet />
      </ChakraProvider>
    </>
  );
};
