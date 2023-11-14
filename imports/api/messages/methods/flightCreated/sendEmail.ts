import { sendEmail as sendEmailPostMark } from 'meteor/quave:email-postmark';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const sendEmail = createMethod({
  name: 'messages.flightCreated.sendEmail',
  schema: z.object({
    emails: z.string().array(),
  }),
  async run({ emails }) {
    await sendEmailPostMark({
      to: emails.join(';'),
      subject: 'Flight Created',
      content: 'A Flight was Created',
    });
  },
});
