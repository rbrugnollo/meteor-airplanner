import React from 'react';
import {
  Switch,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { NotificationId, NotificationType, NotificationIds } from '/imports/api/users/collection';
import { updateNotification } from '/imports/api/users/methods/updateNotification';

const NotificationsSettings = () => {
  const { loggedUser } = useLoggedUser();
  const notificationIds = NotificationIds;

  const isChecked = (notificationId: NotificationId, notificationType: NotificationType) => {
    const booleanOrUndefined =
      loggedUser?.profile?.notifications?.[notificationId]?.[notificationType];
    if (booleanOrUndefined === undefined) return true;
    return booleanOrUndefined;
  };

  const handleChange = async (
    notificationId: NotificationId,
    notificationType: NotificationType,
    value: boolean,
  ) => {
    await updateNotification({
      _id: loggedUser?._id ?? '',
      notificationId,
      notificationType,
      value,
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Mensagem</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Pop-up</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loggedUser &&
            notificationIds.map((notificationId) => (
              <TableRow key={notificationId}>
                <TableCell>{notificationId}</TableCell>
                <TableCell>
                  <Switch
                    defaultChecked={isChecked(notificationId, 'email')}
                    onChange={(_, value) => handleChange(notificationId, 'email', value)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    defaultChecked={isChecked(notificationId, 'push')}
                    onChange={(_, value) => handleChange(notificationId, 'push', value)}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NotificationsSettings;
