import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';
import { publishGroup } from './publishGroup';
import { upsertInReserveEvents } from './upsertInReserveEvents';
import { upsertFlightEvent } from './upsertFlightEvent';
import { upsertMaintenanceEvent } from './upsertMaintenanceEvent';

export const update = createMethod({
  name: 'flights.update',
  schema: z.custom<Omit<Flight, IdBaseCollectionTypes>>(),
  async run(flight) {
    const { _id, ...data } = flight;
    const flightBeforeUpdate = (await FlightsCollection.findOneAsync(_id))!;
    const result = await FlightsCollection.updateAsync(
      { _id },
      {
        $set: {
          ...data,
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

    return result;
  },
});
