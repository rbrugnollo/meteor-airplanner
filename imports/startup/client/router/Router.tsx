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
import UserList, { UserListRoles } from '/imports/ui/pages/users/UserList';
import AirportList, { AirportListRoles } from '/imports/ui/pages/airports/AirportList';
import AirplaneList, { AirplaneListRoles } from '/imports/ui/pages/airplanes/AirplaneList';
import CostCenterList, { CostCenterListRoles } from '/imports/ui/pages/costCenters/CostCenterList';
import FlightScheduleList, {
  FlightScheduleListRoles,
} from '/imports/ui/pages/flightSchedule/FlightScheduleList';

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
            path: 'flightSchedule',
            element: <Authorized Component={FlightScheduleList} roles={FlightScheduleListRoles} />,
          },
          {
            path: 'airports',
            element: <Authorized Component={AirportList} roles={AirportListRoles} />,
          },
          {
            path: 'airplanes',
            element: <Authorized Component={AirplaneList} roles={AirplaneListRoles} />,
          },
          {
            path: 'costCenters',
            element: <Authorized Component={CostCenterList} roles={CostCenterListRoles} />,
          },
          {
            path: 'users',
            element: <Authorized Component={UserList} roles={UserListRoles} />,
          },
        ],
      },
    ],
  },
]);

export default Router;
