import { Meteor } from "meteor/meteor";
import "./email";
import "../api/AirplanesCollection";
import "../api/AirplanesMethods";
import "../api/AirplanesPublications";
import "../api/users/UsersMethods";
import "../api/users/UsersPublications";
import "../api/users/RolesPublications";
import { RolesStartup } from "./roles/roles";

Meteor.startup(async () => {
  await RolesStartup();
});
