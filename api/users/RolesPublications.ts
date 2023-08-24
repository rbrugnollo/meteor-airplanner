import { Meteor } from "meteor/meteor";

Meteor.publish("roles.user", function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ "user._id": this.userId });
  } else {
    this.ready();
  }
});
