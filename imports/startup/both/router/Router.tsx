import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import MainLayout from "/imports/ui/layouts/main/MainLayout";
import { App } from "/imports/ui/App";
import LoginForm from "/imports/ui/pages/login/LoginForm";
import { Meteor } from "meteor/meteor";
import PasswordResetForm from "/imports/ui/pages/login/PasswordResetForm";
import ForgotPasswordForm from "/imports/ui/pages/login/ForgotPasswordForm";
import Authorized from "./Authorized";
import AirplaneList, {
  AirplaneListRoles,
} from "/imports/ui/pages/airplanes/AirplaneList";
import UserList, { UserListRoles } from "/imports/ui/pages/users/UserList";

const loggedInOnly = () => {
  const loggedUserId = Meteor.userId();
  if (!loggedUserId) {
    throw redirect("/login");
  }
  return null;
};

const notLoggedInOnly = () => {
  const loggedUser = Meteor.userId();
  if (loggedUser) {
    throw redirect("/");
  }
  return null;
};

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <LoginForm />,
        loader: notLoggedInOnly,
      },
      {
        path: "forgot",
        element: <ForgotPasswordForm />,
        loader: notLoggedInOnly,
      },
      {
        path: "password/:action/:token",
        element: <PasswordResetForm />,
        loader: notLoggedInOnly,
      },
      {
        path: "app",
        element: <MainLayout />,
        loader: loggedInOnly,
        children: [
          {
            path: "airplanes",
            element: (
              <Authorized Component={AirplaneList} roles={AirplaneListRoles} />
            ),
          },
          {
            path: "users",
            element: <Authorized Component={UserList} roles={UserListRoles} />,
          },
        ],
      },
    ],
  },
]);

export default Router;
