import { Meteor } from 'meteor/meteor';
import { AirplanesStartup } from './airports';
import { RolesStartup } from './roles';
import { WebPushStartup } from './webPush';

Meteor.startup(async () => {
  AirplanesStartup();
  await RolesStartup();
  WebPushStartup();
});
