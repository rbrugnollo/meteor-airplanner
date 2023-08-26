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

Meteor.publish("roles.user", function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ "user._id": this.userId });
  } else {
    this.ready();
  }
});
