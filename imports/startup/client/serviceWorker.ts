import { Meteor } from 'meteor/meteor';
import { subscribeToPush } from '/imports/api/users/methods/subscribeToPush';

Meteor.startup(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((register) => {
        console.info('ServiceWorker registered');
        const applicationServerKey = Meteor.settings.public.vapid.publicKey;
        console.log('applicationServerKey', applicationServerKey);
        register.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          })
          .then((sub) => {
            console.info('Push Registered.', sub);
            subscribeToPush({ subscription: JSON.stringify(sub) }).then(() => {
              console.log('Push subscription saved.');
            });
          })
          .catch((error) => {
            console.log('Push registration failed: ', error);
          });
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  }
});
