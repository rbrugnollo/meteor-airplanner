import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
} from "react-router-dom";
import { Meteor } from 'meteor/meteor';
import Router from './router/Router';
import '/imports/api/AirplanesMethods';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container!);
  
  root.render(<React.StrictMode>
    <RouterProvider router={Router} />
  </React.StrictMode>);
});
