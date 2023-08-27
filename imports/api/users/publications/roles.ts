import { Meteor } from 'meteor/meteor';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';

export const roles = createPublication({
  name: 'users.roles',
  schema: z.undefined(),
  run() {
    if (this.userId) {
      return Meteor.roleAssignment.find({ 'user._id': this.userId });
    } else {
      this.ready();
    }
  },
});
