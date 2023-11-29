import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa6';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { useLoggedUser } from 'meteor/quave:logged-user-react';

const Notifications = () => {
  const navigate = useNavigate();
  const { loggedUser } = useLoggedUser();
  return (
    <Badge
      overlap="circular"
      badgeContent={loggedUser?.profile?.notificationCount}
      color="secondary"
    >
      <Tooltip title="Notificações">
        <IconButton
          onClick={() => {
            navigate('/app/notifications');
          }}
          color="primary"
          aria-label="notifications"
        >
          <FaBell />
        </IconButton>
      </Tooltip>
    </Badge>
  );
};

export default Notifications;
