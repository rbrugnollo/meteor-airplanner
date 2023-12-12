import { Meteor } from 'meteor/meteor';
import webPush from 'web-push';

export const WebPushStartup = () => {
  const { mailTo, privateKey } = Meteor.settings.private.vapid;
  const { publicKey } = Meteor.settings.public.vapid;
  webPush.setVapidDetails(`mailto:${mailTo}`, publicKey, privateKey);
};
