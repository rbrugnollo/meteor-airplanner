import { Mongo } from 'meteor/mongo';

export const COLLECTION_NAME = 'airplanes'; 

export type AirplaneType = {
    _id?: string;
    name: string;
    tailNumber: string;
};

export const AirplanesCollection = new Mongo.Collection<AirplaneType>(COLLECTION_NAME);
