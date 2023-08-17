import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AirplaneList from "/imports/ui/airplanes/AirplaneList";
import MainLayout from "/imports/ui/layouts/main/MainLayout";
import { App } from "/imports/ui/App";
import LoginForm from "/imports/ui/login/LoginForm";
import AirplaneForm from "/imports/ui/airplanes/AirplaneForm";
  
const Router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "login",
                element: <LoginForm />
            },
            {
                path: "app",
                element: <MainLayout />,
                children: [
                    {
                      path: "airplanes",
                      element: <AirplaneList />,
                    },
                    {
                        path: "addairplanes",
                        element: <AirplaneForm />,
                    },
                  ],
            }
        ]
    }
]);

export default Router;
