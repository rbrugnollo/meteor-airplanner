import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import AirplaneList, { AirplaneListRoles } from "/ui/airplanes/AirplaneList";
import MainLayout from "/ui/layouts/main/MainLayout";
import { App } from "/ui/App";
import LoginForm from "/ui/login/LoginForm";
import UserList, { UserListRoles } from "/ui/users/UserList";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";

const loggedInOnly =
  (inRoles: string[] = []) =>
  () => {
    const loggedUserId = Meteor.userId();
    if (!loggedUserId) {
      throw redirect("/login");
    }
    if (inRoles.length) {
      if (!Roles.userIsInRole(loggedUserId, inRoles)) {
        throw redirect("/app");
      }
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
        path: "app",
        element: <MainLayout />,
        loader: loggedInOnly(),
        children: [
          {
            path: "airplanes",
            element: <AirplaneList />,
            loader: loggedInOnly(AirplaneListRoles),
          },
          {
            path: "users",
            element: <UserList />,
            loader: loggedInOnly(UserListRoles),
          },
        ],
      },
    ],
  },
]);

export default Router;
