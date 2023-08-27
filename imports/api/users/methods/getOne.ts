import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const getOne = createMethod({
  name: 'users.getOne',
  schema: z.object({
    _id: z.string(),
  }),
  run({ _id }) {
    return Meteor.users.findOne(_id);
  },
});
