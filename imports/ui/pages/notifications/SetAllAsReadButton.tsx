import React, { useState } from 'react';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FaEnvelopeOpen } from 'react-icons/fa6';
import { setAllAsRead } from '/imports/api/notifications/methods/setAllAsRead';
import { Meteor } from 'meteor/meteor';

const SetAllAsReadButton = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);

    try {
      await setAllAsRead();
      enqueueSnackbar('Notificações marcadas como lidas.', { variant: 'success' });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }

    setLoading(false);
  };

  return (
    <Tooltip title="Marcar todas como lidas">
      <IconButton disabled={loading} onClick={handleClick}>
        {loading ? <CircularProgress color="inherit" size={20} /> : <FaEnvelopeOpen />}
      </IconButton>
    </Tooltip>
  );
};

export default SetAllAsReadButton;
