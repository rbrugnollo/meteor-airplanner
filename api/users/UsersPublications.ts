import { Meteor } from "meteor/meteor";

Meteor.publish("users.list", () => {
  return Meteor.users.find({}, {});
});

interface UsersSelectProps {
  readonly roles: string[];
}

Meteor.publish("users.select", ({ roles }: UsersSelectProps) => {
  return Meteor.users.find({ "profile.roles": { $in: roles } }, {});
});
