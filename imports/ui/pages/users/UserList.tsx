import React, { useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef as MrtColumnDef } from 'material-react-table';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  Theme,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { RoleName } from '/imports/api/users/collection';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { list } from '/imports/api/users/publications/list';
import UserListFilter, { UserListFilterValues } from './UserListFilter';
import UserForm from './UserForm';

export const UserListRoles: RoleName[] = ['Admin'];

const UserList = () => {
  const [selector, setSelector] = useState<Mongo.Selector<Meteor.User>>({ role: null });
  const [modalProps, setModalProps] = useState<{ open: boolean; userId?: string }>({
    open: false,
    userId: undefined,
  });

  const isLoading = useSubscribe(() => list(selector));
  const users = useFind(() => Meteor.users.find(selector), [selector]);
  const columns = useMemo<MrtColumnDef<Meteor.User>[]>(
    () => [
      {
        accessorKey: 'profile.name',
        header: 'Name',
        size: 150,
      },
      {
        accessorKey: 'profile.roles',
        accessorFn: (user) => user.profile?.roles?.join(', '),
        header: 'Roles',
        size: 150,
      },
    ],
    [users],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));

  const handleFilter = (values: UserListFilterValues) => {
    let selector = {};
    if (values.role) {
      selector = { ...selector, 'profile.roles': { $in: [values.role] } };
    }
    setSelector(selector);
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 0 },
          }}
        >
          <Stack spacing={2}>
            <Stack
              sx={{ px: { xs: 2 } }}
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Typography variant="h5">Users</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <Button
                    onClick={() => setModalProps({ open: true, userId: undefined })}
                    startIcon={<AddIcon />}
                    variant="contained"
                  >
                    Add
                  </Button>
                  <UserListFilter onFilter={handleFilter} />
                </Stack>
              </div>
            </Stack>
            <MaterialReactTable<Meteor.User>
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableDensityToggle={false}
              enableSorting={false}
              enableFilters={false}
              enableHiding={false}
              enableColumnActions={false}
              enableRowActions
              state={{ isLoading: isLoading() }}
              muiTablePaperProps={lgUp ? {} : { elevation: 0 }}
              columns={columns}
              data={users}
              renderRowActionMenuItems={({ row, closeMenu }) => [
                <MenuItem
                  key={3}
                  onClick={() => {
                    closeMenu();
                    setModalProps({ open: true, userId: row.original._id });
                  }}
                >
                  <ListItemIcon>
                    <Edit color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>,
                <MenuItem
                  key={2}
                  onClick={() => {
                    console.info('Remove', row);
                    closeMenu();
                  }}
                >
                  <ListItemIcon>
                    <Delete color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>,
              ]}
            />
          </Stack>
        </Container>
        <UserForm
          {...modalProps}
          onClose={() => setModalProps({ open: false, userId: undefined })}
        />
      </Box>
    </>
  );
};

export default UserList;
