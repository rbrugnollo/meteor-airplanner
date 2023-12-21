import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { App } from '/imports/ui/App';
import { Meteor } from 'meteor/meteor';
import LoginForm from '/imports/ui/pages/login/LoginForm';
import AuthLayout from '/imports/ui/layouts/auth/AuthLayout';
import ForgotPasswordForm from '/imports/ui/pages/login/ForgotPasswordForm';
import PasswordResetForm from '/imports/ui/pages/login/PasswordResetForm';
import MainLayout from '/imports/ui/layouts/main/MainLayout';
import Authorized from './Authorized';
import UserList from '/imports/ui/pages/users/UserList';
import AirportList from '/imports/ui/pages/airports/AirportList';
import AirplaneList from '/imports/ui/pages/airplanes/AirplaneList';
import CostCenterList from '/imports/ui/pages/costCenters/CostCenterList';
import FlightList from '/imports/ui/pages/flights/FlightList';
import Schedule from '/imports/ui/pages/schedule/Schedule';
import Settings from '/imports/ui/pages/settings/Settings';
import NotificationList from '/imports/ui/pages/notifications/list/NotificationList';
import FlightPage from '/imports/ui/pages/flight/FlightPage';

const mainLoader = ({ request }: { request: Request }) => {
  const url = `${window.location.origin}/`;
  if (request.url === url) {
    const loggedUserId = Meteor.userId();
    if (!loggedUserId) {
      throw redirect('/auth/login');
    } else {
      throw redirect('/app');
    }
  }

  return null;
};

const loggedInOnly = () => {
  const loggedUserId = Meteor.userId();
  if (!loggedUserId) {
    throw redirect('/auth/login');
  }
  return null;
};

const notLoggedInOnly = () => {
  const loggedUser = Meteor.userId();
  if (loggedUser) {
    throw redirect('/app');
  }
  return null;
};

const Router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    loader: mainLoader,
    children: [
      {
        path: 'auth',
        element: <AuthLayout />,
        loader: notLoggedInOnly,
        children: [
          {
            path: 'login',
            element: <LoginForm />,
          },
          {
            path: 'forgot',
            element: <ForgotPasswordForm />,
          },
          {
            path: 'password/:action/:token',
            element: <PasswordResetForm />,
          },
        ],
      },
      {
        path: 'app',
        element: <MainLayout />,
        loader: loggedInOnly,
        children: [
          {
            path: 'flights/:id',
            element: <Authorized Component={FlightPage} permission="flights.list" />,
          },
          {
            path: 'flights',
            element: <Authorized Component={FlightList} permission="flights.list" />,
          },
          {
            path: 'airports',
            element: <Authorized Component={AirportList} permission="airports.list" />,
          },
          {
            path: 'airplanes',
            element: <Authorized Component={AirplaneList} permission="airplanes.list" />,
          },
          {
            path: 'costCenters',
            element: <Authorized Component={CostCenterList} permission="costCenters.list" />,
          },
          {
            path: 'users',
            element: <Authorized Component={UserList} permission="users.list" />,
          },
          {
            path: 'schedule',
            element: <Authorized Component={Schedule} permission="schedule.list" />,
          },
          {
            path: 'notifications',
            element: <Authorized Component={NotificationList} permission="notification.list" />,
          },
          {
            path: 'settings',
            element: <Authorized Component={Settings} permission="settings" />,
          },
        ],
      },
    ],
  },
]);

export default Router;
