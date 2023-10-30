import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { EventsCollection } from '../../events/collection';
import { FlightsCollection } from '../../flights/collection';
import { CostCenter, CostCentersCollection } from '../collection';

export const update = createMethod({
  name: 'costCenters.update',
  schema: z.custom<Omit<CostCenter, IdBaseCollectionTypes>>(),
  async run(costCenter) {
    const { _id, ...data } = costCenter;
    const result = CostCentersCollection.updateAsync(
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
    await updateFlightsCollection({
      costCenter: { value: _id, label: data.name },
    });

    await updateEventsCollection({
      costCenter: { value: _id, label: data.name },
    });

    return result;
  },
});

export const updateFlightsCollection = createMethod({
  name: 'costCenters.updateFlightsCollection',
  schema: z.object({
    costCenter: ValueLabelTypeSchema,
  }),
  async run({ costCenter }) {
    await FlightsCollection.updateAsync(
      {
        'requesters.costCenter.value': costCenter.value,
        scheduledDepartureDateTime: { $gte: new Date() },
      },
      {
        $set: {
          'requesters.$.costCenter.label': costCenter.label,
        },
      },
      { multi: true },
    );
  },
});

export const updateEventsCollection = createMethod({
  name: 'costCenters.updateEventsCollection',
  schema: z.object({
    costCenter: ValueLabelTypeSchema,
  }),
  async run({ costCenter }) {
    await EventsCollection.updateAsync(
      {
        'flight.requesters.costCenter.value': costCenter.value,
        start: { $gte: new Date() },
      },
      {
        $set: {
          'flight.requesters.$.costCenter.label': costCenter.label,
        },
      },
      { multi: true },
    );
  },
});
