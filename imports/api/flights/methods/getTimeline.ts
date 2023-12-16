import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AuditLogsCollection } from '../../auditLogs/collection';
import { COLLECTION_NAME as FlightsCollectionName } from '../collection';

export const getTimeline = createMethod({
  name: 'flights.getTimeline',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const logs = await AuditLogsCollection.find(
      { docId: flightId, collection: FlightsCollectionName },
      { sort: { createdAt: -1 } },
    ).fetchAsync();

    return logs;
  },
});
