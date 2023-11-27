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
import { Meteor } from 'meteor/meteor';

export const insert = createMethod({
  name: 'flights.insert',
  schema: z.custom<Omit<Flight, BaseCollectionTypes>>(),
  async run(flight) {
    const user = await Meteor.users.findOneAsync(this.userId!);
    const result = await FlightsCollection.insertAsync({
      ...flight,
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdByName: user?.profile?.name ?? this.userId!,
      updatedByName: user?.profile?.name ?? this.userId!,
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });

    // Update dependent collections
    await upsertFlightEvent(result);
    await upsertInReserveEvents({
      flightBeforeUpdate: (await FlightsCollection.findOneAsync(result))!,
      checkPreviousFlight: true,
    });
    await upsertMaintenanceEvent({ flightId: result, checkPreviousFlight: true });
    if (flight.published) await publishGroup(flight.groupId);

    // Send Notifications
    await flightCreated({ flightId: result });
    await flightAuthorize({ flightId: result });

    return result;
  },
});
