import { Meteor } from 'meteor/meteor';

export const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': Meteor.settings.private.greatCircleMapper.apiKey,
};
