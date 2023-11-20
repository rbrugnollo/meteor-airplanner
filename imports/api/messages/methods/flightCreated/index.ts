import { uniq } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { sendEmail } from './sendEmail';
import { FlightsCollection } from '/imports/api/flights/collection';

export const flightCreated = createMethod({
  name: 'messages.flightCreated',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    const flight = await FlightsCollection.findOneAsync(_id);

    const recipientIds = uniq(
      [
        flight?.captain?.value ?? '',
        flight?.firstOfficer?.value ?? '',
        ...(flight?.passengers?.map((m) => m.value ?? '') ?? []),
        ...(flight?.requesters?.map((m) => m.requester?.value ?? '') ?? []),
        flight?.createdBy ?? '',
        flight?.updatedBy ?? '',
      ].filter((m) => m),
    );

    const users = await Meteor.users.find({ _id: { $in: recipientIds } }).fetchAsync();
    const emails = users
      .filter((f) => f.profile?.notifications?.['flight-created']?.email)
      .map((m) => m.emails?.[0]?.address ?? '')
      .filter((m) => m);

    await sendEmail({ emails });

    // const pushUpIds = users
    //   .filter((f) => f.profile?.notifications?.['flight-created']?.push)
    //   .map((m) => m._id)
    //   .filter((m) => m);

    // pushUpIds.forEach((pushUpId) => {
    //   // Push Up Notifications
    // });
  },
});
