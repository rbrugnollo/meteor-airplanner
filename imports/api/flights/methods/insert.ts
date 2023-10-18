import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';
import { publishGroup } from './publishGroup';
import { updateInReserveEvents } from './updateInReserveEvents';
import { upsertFlightEvent } from './upsertFlightEvent';

export const insert = createMethod({
  name: 'flights.insert',
  schema: z.custom<Omit<Flight, BaseCollectionTypes>>(),
  async run(flight) {
    const result = await FlightsCollection.insertAsync({
      ...flight,
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });

    // Update dependent collections
    await upsertFlightEvent(result);
    await updateInReserveEvents({
      flightBeforeUpdate: (await FlightsCollection.findOneAsync(result))!,
      checkPreviousFlight: true,
    });
    if (flight.published) await publishGroup(flight.groupId);

    return result;
  },
});
