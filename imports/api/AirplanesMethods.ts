import { Meteor } from "meteor/meteor";
import { AirplanesCollection } from "./AirplanesCollection";

interface InsertAirplaneVm {
    readonly name: string;
    readonly tailNumber: string;
};

Meteor.methods({
    'airplanes.insert'(data: InsertAirplaneVm) {
        AirplanesCollection.insert(data);
    }
});
