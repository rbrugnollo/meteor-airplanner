import React from 'react';
import {
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { FiLogOut } from 'react-icons/fi';
import { Meteor } from 'meteor/meteor';
import { useNavigate } from 'react-router';

const UserProfile = () => {
  const navigate = useNavigate();
  const { loggedUser } = useLoggedUser();

  const logOut = () => {
    Meteor.logout(() => {
      navigate('/auth/login');
    });
  };

  return (
    <>
      <Accordion
        style={{
          background: 'transparent',
          boxShadow: 'none',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack spacing={2}>
            <Typography color="neutral.100" variant="subtitle2">
              {loggedUser?.profile?.name}
            </Typography>
            <Typography color="neutral.500" variant="body2" style={{ marginTop: 0 }}>
              {loggedUser?.username}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Button style={{ color: 'white' }} onClick={logOut} startIcon={<FiLogOut />}>
            Sign out
          </Button>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default UserProfile;
