import React from "react";
import MainLayout from "./layouts/main/MainLayout";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import LoginForm from "./login/LoginForm";

const theme = extendTheme({});

export const App = () => {
  return (
    <>
      <ChakraProvider theme={theme}>
        <MainLayout>
          <LoginForm />
        </MainLayout>
      </ChakraProvider>
    </>
  );
};
