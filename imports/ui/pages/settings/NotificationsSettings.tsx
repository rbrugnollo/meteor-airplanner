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
import {
  NotificationId,
  NotificationType,
  NotificationLabels,
} from '/imports/api/users/collection';
import { updateNotification } from '/imports/api/users/methods/updateNotification';

const NotificationsSettings = () => {
  const { loggedUser } = useLoggedUser();
  const notificationLabels = NotificationLabels;

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
    <TableContainer
      component={Paper}
      sx={{
        py: 2,
      }}
    >
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Mensagem</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Pop-up</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loggedUser &&
            notificationLabels.map(({ id: notificationId, label }) => (
              <TableRow key={notificationId}>
                <TableCell>{label}</TableCell>
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
