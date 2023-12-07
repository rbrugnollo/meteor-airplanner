import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes, BaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';
import { publishGroup } from './publishGroup';
import { upsertInReserveEvents } from './upsertInReserveEvents';
import { upsertFlightEvent } from './upsertFlightEvent';
import { upsertMaintenanceEvent } from './upsertMaintenanceEvent';
import { flightAuthorize } from '../../notifications/methods/flightAuthorize';
import { flightUpdated } from '../../notifications/methods/flightUpdated';
import { deepDiff } from '../../lib/deepDiff';

export const update = createMethod({
  name: 'flights.update',
  schema: z.custom<Omit<Flight, IdBaseCollectionTypes>>(),
  async run(flight) {
    const { _id, ...data } = flight;
    const flightBeforeUpdate = (await FlightsCollection.findOneAsync(_id))!;
    let setFlight: Omit<Flight, BaseCollectionTypes> = { ...data };
    let sendAuthorizationMessage = false;

    // If the flight was authorized and the scheduled departure date or airplane changed, then the flight is no longer authorized
    if (
      flightBeforeUpdate.authorized &&
      (flightBeforeUpdate.scheduledDepartureDateTime !== flight.scheduledArrivalDateTime ||
        flightBeforeUpdate.airplane?.value !== flight.airplane?.value)
    ) {
      setFlight = {
        ...setFlight,
        authorized: false,
      };
      sendAuthorizationMessage = true;
    }

    // Update
    const result = await FlightsCollection.updateAsync(
      { _id },
      {
        $set: {
          ...setFlight,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );

    // Update dependent collections
    await upsertFlightEvent(_id);
    await upsertInReserveEvents({
      flightBeforeUpdate: flightBeforeUpdate,
      checkPreviousFlight: true,
    });
    await upsertMaintenanceEvent({ flightId: _id, checkPreviousFlight: true });
    if (!flightBeforeUpdate.published && flight.published) await publishGroup(flight.groupId);

    // Send Notifications
    if (sendAuthorizationMessage) {
      await flightAuthorize({ flightId: _id });
    }
    await flightUpdated({ flightId: _id, difference: deepDiff(flightBeforeUpdate, flight) });

    return result;
  },
});
