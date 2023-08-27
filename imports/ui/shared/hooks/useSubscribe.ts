import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
export { useFind } from 'meteor/react-meteor-data';

const useSubscribeClient = (func: () => Meteor.SubscriptionHandle): (() => boolean) => {
  let updateOnReady = false;
  let subscription: Meteor.SubscriptionHandle;

  const isReady = useTracker(
    () => {
      subscription = func();
      return subscription.ready();
    },
    () => !updateOnReady,
  );

  return () => {
    updateOnReady = true;
    return !isReady;
  };
};

const useSubscribeServer =
  (_: () => Meteor.SubscriptionHandle): (() => boolean) =>
  () =>
    false;

export const useSubscribe = Meteor.isServer ? useSubscribeServer : useSubscribeClient;
