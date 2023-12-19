import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AuditLogsCollection } from '../collection';

export const list = createPublication({
  name: 'auditLogs.list',
  schema: z.object({
    docId: z.string(),
    collection: z.string(),
  }),
  async run({ docId, collection }) {
    console.log('auditLogs.list', docId, collection);
    return AuditLogsCollection.find(
      { docId, collection },
      {
        sort: { createdAt: -1 },
        projection: { _id: 1, doc: 1, docId: 1, collection: 1, createdAt: 1 },
      },
    );
  },
});
