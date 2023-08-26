import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const AirplanesSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  name: {
    type: String,
    min: 1,
  },
  tailNumber: {
    type: String,
    min: 1,
  },
});

export const COLLECTION_NAME = "airplanes";

export type AirplaneType = {
  _id?: string;
  name: string;
  tailNumber: string;
};

export const AirplanesCollection = new Mongo.Collection<AirplaneType>(
  COLLECTION_NAME
);
