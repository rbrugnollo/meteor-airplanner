import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';
import { publishGroup } from './publishGroup';
import { updateInReserveEvents } from './updateInReserveEvents';
import { upsertFlightEvent } from './upsertFlightEvent';

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
    await updateInReserveEvents({
      flightBeforeUpdate: flightBeforeUpdate,
      checkPreviousFlight: true,
    });
    if (!flightBeforeUpdate.published && flight.published) await publishGroup(flight.groupId);

    return result;
  },
});
