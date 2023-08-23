import { Meteor } from "meteor/meteor";

Meteor.publish("users.list", () => {
  return Meteor.users.find({}, {});
});
