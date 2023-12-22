import React, { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef as MrtColumnDef,
  MRT_Row as MrtRow,
} from 'material-react-table';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  Theme,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import AddIcon from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/airplanes/publications/list';
import { Airplane, AirplanesCollection } from '/imports/api/airplanes/collection';
import AirplaneForm from './AirplaneForm';
import { fetchPositions } from '/imports/api/airplanes/methods/fetchPositions';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import { enable } from '/imports/api/airplanes/methods/enable';
import { disable } from '/imports/api/airplanes/methods/disable';
import { Meteor } from 'meteor/meteor';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

const AirplaneList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoaded, setIsLoaded] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canRemove, setCanRemove] = useState(false);
  const [modalProps, setModalProps] = useState<{ open: boolean; airplaneId?: string }>({
    open: false,
    airplaneId: undefined,
  });
  const isLoading = useSubscribe(list);
  const airplanes = useFind(() => AirplanesCollection.find());
  const columns = useMemo<MrtColumnDef<Airplane>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
      },
      {
        accessorKey: 'tailNumber',
        header: 'Registro',
      },
      {
        accessorKey: 'seats',
        header: 'No de Assentos',
      },
      {
        id: 'status',
        header: 'Em vôo?',
        Cell: ({ row }: { row: MrtRow<Airplane> }) => {
          return row.original?.position?.isFlying ? (
            <a
              href={`https://www.flightradar24.com/${row.original.tailNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              Flying
            </a>
          ) : (
            <a
              href={`https://www.flightradar24.com/data/aircraft/${row.original.tailNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              Not Flying
            </a>
          );
        },
      },
    ],
    [],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));
  // Verify Permissions
  useEffect(() => {
    if (isLoaded) return;
    setIsLoaded(true);
    hasPermission({ permission: 'airplanes.update' }).then((hasPermission) => {
      setCanUpdate(hasPermission);
    });
    hasPermission({ permission: 'airplanes.remove' }).then((hasPermission) => {
      setCanRemove(hasPermission);
    });
  }, []);

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
              <Typography variant="h5">Aeronaves</Typography>
              <div>
                <AuthorizedComponent permission="airplanes.insert">
                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      onClick={() => setModalProps({ open: true, airplaneId: undefined })}
                    >
                      Adicionar
                    </Button>
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      onClick={() => {
                        fetchPositions();
                      }}
                    >
                      Verificar Posições
                    </Button>
                  </Stack>
                </AuthorizedComponent>
              </div>
            </Stack>
            <MaterialReactTable<Airplane>
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableDensityToggle={false}
              enableSorting={false}
              enableFilters={false}
              enableHiding={false}
              enableColumnActions={false}
              enableRowVirtualization
              state={{ isLoading: isLoading() }}
              muiTablePaperProps={lgUp ? {} : { elevation: 0 }}
              columns={columns}
              data={airplanes}
              enableRowActions
              renderRowActionMenuItems={({ row, closeMenu }) => [
                <MenuItem
                  key={3}
                  disabled={!canUpdate}
                  onClick={() => {
                    closeMenu();
                    setModalProps({ open: true, airplaneId: row.original._id });
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
                      enqueueSnackbar('Aeronave removida com sucesso.', {
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
        <AirplaneForm
          {...modalProps}
          onClose={() => setModalProps({ open: false, airplaneId: undefined })}
        />
      </Box>
    </>
  );
};

export default AirplaneList;
