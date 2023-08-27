import { Meteor } from 'meteor/meteor';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';

export const list = createPublication({
  name: 'users.list',
  schema: z.undefined(),
  run() {
    return Meteor.users.find({}, {});
  },
});
