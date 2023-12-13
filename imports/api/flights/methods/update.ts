import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import dayjs from 'dayjs';
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
      (!dayjs(flightBeforeUpdate.scheduledDepartureDateTime).isSame(
        dayjs(flight.scheduledDepartureDateTime),
      ) ||
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

    // Fire and forget
    const flightAfterUpdate = (await FlightsCollection.findOneAsync(_id))!;
    updateFireAndForget({
      flightBeforeUpdate,
      flightAfterUpdate,
      sendAuthorizationMessage,
    });

    return result;
  },
});

export const updateFireAndForget = createMethod({
  name: 'flights.updateFireAndForget',
  schema: z.object({
    flightBeforeUpdate: z.custom<Flight>(),
    flightAfterUpdate: z.custom<Flight>(),
    sendAuthorizationMessage: z.boolean(),
  }),
  async run({ flightBeforeUpdate, flightAfterUpdate, sendAuthorizationMessage }) {
    // Update dependent collections
    await upsertFlightEvent(flightAfterUpdate._id);
    await upsertInReserveEvents({
      flightBeforeUpdate: flightBeforeUpdate,
      checkPreviousFlight: true,
    });
    await upsertMaintenanceEvent({ flightId: flightAfterUpdate._id, checkPreviousFlight: true });
    if (!flightBeforeUpdate.published && flightAfterUpdate.published)
      await publishGroup(flightAfterUpdate.groupId);

    // Send Notifications
    if (sendAuthorizationMessage) {
      await flightAuthorize({ flightId: flightAfterUpdate._id });
    }
    await flightUpdated({
      flightId: flightAfterUpdate._id,
      difference: deepDiff(flightBeforeUpdate, flightAfterUpdate),
    });
  },
});
