import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';

export interface UsersListFilters {
  role?: string;
}

export const list = createPublication({
  name: 'users.list',
  schema: z.custom<Mongo.Selector<Meteor.User>>(),
  run(selector) {
    return Meteor.users.find(selector, {});
  },
});
