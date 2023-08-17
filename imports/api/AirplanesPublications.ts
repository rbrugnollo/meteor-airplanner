import { Meteor } from "meteor/meteor";
import { AirplanesCollection } from "./AirplanesCollection";

Meteor.publish('airplanes.list', () => {
    return AirplanesCollection.find();
});
