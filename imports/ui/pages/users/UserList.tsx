import React, { useEffect, useMemo, useState } from 'react';
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
import { useSnackbar } from 'notistack';
import AddIcon from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { list } from '/imports/api/users/publications/list';
import UserListFilter, { UserListFilterValues } from './UserListFilter';
import UserForm from './UserForm';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import { disable } from '/imports/api/users/methods/disable';
import { enable } from '/imports/api/users/methods/enable';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

const UserList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoaded, setIsLoaded] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canRemove, setCanRemove] = useState(false);
  const [selector, setSelector] = useState<Mongo.Selector<Meteor.User>>({ role: null });
  const [modalProps, setModalProps] = useState<{ open: boolean; userId?: string }>({
    open: false,
    userId: undefined,
  });
  // Verify Permissions
  useEffect(() => {
    if (isLoaded) return;
    setIsLoaded(true);
    hasPermission({ permission: 'users.update' }).then((hasPermission) => {
      setCanUpdate(hasPermission);
    });
    hasPermission({ permission: 'users.remove' }).then((hasPermission) => {
      setCanRemove(hasPermission);
    });
  }, []);
  const isLoading = useSubscribe(() => list(selector));
  const users = useFind(() => Meteor.users.find(selector), [selector]);
  const columns = useMemo<MrtColumnDef<Meteor.User>[]>(
    () => [
      {
        accessorKey: 'profile.name',
        header: 'Nome',
        size: 150,
      },
      {
        accessorKey: 'profile.roles',
        accessorFn: (user) => user.profile?.roles?.join(', '),
        header: 'Funções',
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
              <Typography variant="h5">Usuários</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <AuthorizedComponent permission="users.insert">
                    <Button
                      onClick={() => setModalProps({ open: true, userId: undefined })}
                      startIcon={<AddIcon />}
                      variant="contained"
                    >
                      Adicionar
                    </Button>
                  </AuthorizedComponent>
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
                  disabled={!canUpdate}
                  onClick={() => {
                    closeMenu();
                    setModalProps({ open: true, userId: row.original._id });
                  }}
                >
                  <ListItemIcon>
                    <Edit color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Editar</ListItemText>
                </MenuItem>,
                <MenuItem
                  key={2}
                  disabled={!canRemove}
                  onClick={async () => {
                    try {
                      await disable({ _id: row.original._id });
                      enqueueSnackbar('Usuário removido com sucesso.', {
                        variant: 'success',
                        action: () => (
                          <Button
                            color="inherit"
                            size="small"
                            onClick={async () => {
                              try {
                                await enable({ _id: row.original._id });
                                enqueueSnackbar('Remoção cancelada.');
                              } catch (e: unknown) {
                                console.log(e);
                                if (e instanceof Meteor.Error) {
                                  enqueueSnackbar(e.message, { variant: 'error' });
                                }
                              }
                            }}
                          >
                            Desfazer
                          </Button>
                        ),
                      });
                    } catch (e: unknown) {
                      console.log(e);
                      if (e instanceof Meteor.Error) {
                        enqueueSnackbar(e.message, { variant: 'error' });
                      }
                    }
                    closeMenu();
                  }}
                >
                  <ListItemIcon>
                    <Delete color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Remover</ListItemText>
                </MenuItem>,
              ]}
            />
          </Stack>
        </Container>
        <UserForm
          {...modalProps}
          onSuccess={() => setModalProps({ open: false, userId: undefined })}
          onClose={() => setModalProps({ open: false, userId: undefined })}
        />
      </Box>
    </>
  );
};

export default UserList;
