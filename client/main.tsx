import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import Router from '/imports/startup/client/router/Router';
import '/imports/startup/client';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  if (!container) return;

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <RouterProvider router={Router} />
    </React.StrictMode>,
  );
});
