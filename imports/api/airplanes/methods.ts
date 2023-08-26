import { Meteor } from "meteor/meteor";
import { AirplanesCollection } from "./collection";

interface InsertAirplaneVm {
  readonly name: string;
  readonly tailNumber: string;
}

interface UpdateAirplaneVm {
  readonly _id: string;
  readonly name: string;
  readonly tailNumber: string;
}

Meteor.methods({
  "airplanes.insert"(data: InsertAirplaneVm) {
    AirplanesCollection.insert(data);
  },
  "airplanes.getOne"(airplaneId) {
    return AirplanesCollection.findOne(airplaneId);
  },
  "airplanes.update"(data: UpdateAirplaneVm) {
    const { _id, ...updateData } = data;
    AirplanesCollection.update({ _id: _id }, { $set: updateData });
  },
  "airplanes.remove"(airplaneId) {
    return AirplanesCollection.remove(airplaneId);
  },
});
