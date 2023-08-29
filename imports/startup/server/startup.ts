import { Meteor } from 'meteor/meteor';
import { AirplanesStartup } from './airports';
import { RolesStartup } from './roles';

Meteor.startup(async () => {
  AirplanesStartup();
  await RolesStartup();
});
