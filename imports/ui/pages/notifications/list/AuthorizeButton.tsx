import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { authorize } from '/imports/api/flights/methods/authorize';
import { Meteor } from 'meteor/meteor';

interface AuthorizeButtonProps {
  readonly flightId: string;
}

const AuthorizeButton = ({ flightId }: AuthorizeButtonProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);

    try {
      await authorize({ flightId, authorized: true });
      enqueueSnackbar('Vôo Autorizado.', { variant: 'success' });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }

    setLoading(false);
  };

  return (
    <Button disabled={loading} variant="outlined" onClick={handleClick}>
      Autorizar Vôo
    </Button>
  );
};

export default AuthorizeButton;
