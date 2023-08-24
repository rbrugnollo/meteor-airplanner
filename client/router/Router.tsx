import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import AirplaneList, { AirplaneListRoles } from "/ui/airplanes/AirplaneList";
import MainLayout from "/ui/layouts/main/MainLayout";
import { App } from "/ui/App";
import LoginForm from "/ui/login/LoginForm";
import UserList, { UserListRoles } from "/ui/users/UserList";
import { Meteor } from "meteor/meteor";
import PasswordResetForm from "/ui/login/PasswordResetForm";
import ForgotPasswordForm from "/ui/login/ForgotPasswordForm";
import Authorized from "./Authorized";

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
