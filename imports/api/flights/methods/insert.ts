import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';
import { publishGroup } from './publishGroup';
import { upsertInReserveEvents } from './upsertInReserveEvents';
import { upsertFlightEvent } from './upsertFlightEvent';
import { upsertMaintenanceEvent } from './upsertMaintenanceEvent';
import { flightCreated } from '../../notifications/methods/flightCreated';
import { flightAuthorize } from '../../notifications/methods/flightAuthorize';

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

    insertFireAndForget({ flightId: result });

    return result;
  },
});

export const insertFireAndForget = createMethod({
  name: 'flights.insertFireAndForget',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const flight = await FlightsCollection.findOneAsync(flightId);
    if (!flight) return;

    // Update dependent collections
    await upsertFlightEvent(flightId);
    await upsertInReserveEvents({
      flightBeforeUpdate: flight,
      checkPreviousFlight: true,
    });
    await upsertMaintenanceEvent({ flightId, checkPreviousFlight: true });
    if (flight.published) await publishGroup(flight.groupId);

    // Send Notifications
    await flightCreated({ flightId });
    await flightAuthorize({ flightId });
  },
});
