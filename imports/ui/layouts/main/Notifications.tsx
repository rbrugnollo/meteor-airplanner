import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa6';
import { Badge, IconButton } from '@mui/material';

const Notifications = () => {
  const navigate = useNavigate();
  return (
    <Badge overlap="circular" badgeContent={4} color="secondary">
      <IconButton
        onClick={() => {
          navigate('/app/notifications');
        }}
        color="primary"
        aria-label="notifications"
      >
        <FaBell />
      </IconButton>
    </Badge>
  );
};

export default Notifications;
