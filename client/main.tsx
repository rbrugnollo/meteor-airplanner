import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import Router from '/imports/startup/client/router/Router';
import '/imports/startup/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { createTheme } from '/imports/ui/theme';

const theme = createTheme();

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  if (!container) return;

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <RouterProvider router={Router} />
        </SnackbarProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
});
