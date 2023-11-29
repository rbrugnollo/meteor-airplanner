import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import { useMatch } from 'react-router-dom';
import { Notification } from '/imports/api/notifications/collection';
import { getOne } from '/imports/api/notifications/methods/getOne';
import { useSnackbar } from 'notistack';

const Notification = () => {
  const match = useMatch('app/notifications/:id');
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | undefined>(undefined);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const notificationResult = await getOne({ _id: match?.params.id ?? '' });
      setNotification(notificationResult);
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
    setLoading(false);
  };

  return !notification ? (
    <div />
  ) : notification.type === 'flight-created' ? (
    <div>Flight Created</div>
  ) : notification.type === 'flight-updated' ? (
    <div>Flight Updated</div>
  ) : notification.type === 'flight-canceled' ? (
    <div>Flight Cancelled</div>
  ) : notification.type === 'flight-authorize' ? (
    <div>Authorize Flight</div>
  ) : (
    <div />
  );
};

export default Notification;
