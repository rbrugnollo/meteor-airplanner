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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';
import 'mapbox-gl/dist/mapbox-gl.css';

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

const theme = createTheme();

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  if (!container) return;

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <SnackbarProvider>
            <RouterProvider router={Router} />
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
});
