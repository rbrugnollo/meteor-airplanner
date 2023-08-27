import { Meteor } from 'meteor/meteor';
import { AirplanesCollection } from '../collection';

Meteor.publish('airplanes.list', () => AirplanesCollection.find());
