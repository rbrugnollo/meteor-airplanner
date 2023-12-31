import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef as MrtColumnDef,
  MRT_Virtualizer as MrtVirtualizer,
} from 'material-react-table';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  Theme,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/airports/publications/list';
import { Airport, AirportsCollection } from '/imports/api/airports/collection';
import AirportListFilter, { AirportListFilterValues } from './AirportListFilter';
import { Mongo } from 'meteor/mongo';
import AirportForm from './AirportForm';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import { disable } from '/imports/api/airports/methods/disable';
import { enable } from '/imports/api/airports/methods/enable';
import { Meteor } from 'meteor/meteor';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

const AirportList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoaded, setIsLoaded] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canRemove, setCanRemove] = useState(false);
  const [modalProps, setModalProps] = useState<{ open: boolean; airportId?: string }>({
    open: false,
    airportId: undefined,
  });
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef =
    useRef<MrtVirtualizer<HTMLDivElement, HTMLTableRowElement>>(null);
  const [selector, setSelector] = useState<Mongo.Selector<Airport>>({ role: null });
  const [options, setOptions] = useState<Mongo.Options<Airport>>({ sort: { name: 1 }, limit: 50 });
  const isLoading = useSubscribe(() => {
    return list({ selector, options });
  });
  const airports = useFind(() => AirportsCollection.find(), [selector, options]);
  const columns = useMemo<MrtColumnDef<Airport>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'icao',
        header: 'ICAO',
      },
      {
        accessorKey: 'city',
        header: 'Cidade',
      },
      {
        accessorKey: 'country',
        header: 'País',
      },
      {
        accessorKey: 'timezone',
        header: 'Timezone',
      },
    ],
    [],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));
  // Verify Permissions
  useEffect(() => {
    if (isLoaded) return;
    setIsLoaded(true);
    hasPermission({ permission: 'airports.update' }).then((hasPermission) => {
      setCanUpdate(hasPermission);
    });
    hasPermission({ permission: 'airports.remove' }).then((hasPermission) => {
      setCanRemove(hasPermission);
    });
  }, []);

  const fetchMoreOnBottomReached = (containerRefElement?: HTMLDivElement | null) => {
    if (containerRefElement) {
      const currentLimit = options?.limit ?? 0;
      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      if (scrollHeight - scrollTop - clientHeight < 400 && !isLoading() && currentLimit < 500) {
        setOptions({ ...options, limit: currentLimit + 50 });
      }
    }
  };

  const handleFilter = (values: AirportListFilterValues) => {
    let selector = {};
    if (values.search) {
      selector = {
        $or: [
          { name: { $regex: values.search, $options: 'i' } },
          { city: { $regex: values.search, $options: 'i' } },
          { icao: { $regex: values.search, $options: 'i' } },
        ],
      };
    }
    setSelector(selector);
    // Scroll to the top of the table when the filter changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
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
              <Typography variant="h5">Aeroportos</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <AuthorizedComponent permission="airports.insert">
                    <Button
                      startIcon={<Add />}
                      onClick={() => setModalProps({ open: true, airportId: undefined })}
                      variant="contained"
                    >
                      Adicionar
                    </Button>
                  </AuthorizedComponent>
                  <AirportListFilter onFilter={handleFilter} />
                </Stack>
              </div>
            </Stack>
            <MaterialReactTable<Airport>
              enablePagination={false}
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableDensityToggle={false}
              enableSorting={false}
              enableFilters={false}
              enableHiding={false}
              enableColumnActions={false}
              enableRowVirtualization
              rowVirtualizerProps={{ overscan: 4 }}
              rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
              state={{
                isLoading: isLoading(),
                columnVisibility: { icao: lgUp, country: lgUp, timezone: lgUp },
              }}
              muiTablePaperProps={lgUp ? {} : { elevation: 0 }}
              columns={columns}
              data={airports}
              muiTableContainerProps={{
                ref: tableContainerRef,
                sx: { maxHeight: lgUp ? 'calc(100vh - 90px)' : 'calc(100vh - 130px)' },
                onScroll: (event: React.UIEvent<HTMLDivElement>) =>
                  fetchMoreOnBottomReached(event.target as HTMLDivElement),
              }}
              enableRowActions
              renderRowActionMenuItems={({ row, closeMenu }) => [
                <MenuItem
                  key={3}
                  disabled={!canUpdate}
                  onClick={() => {
                    closeMenu();
                    setModalProps({ open: true, airportId: row.original._id });
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
                      enqueueSnackbar('Aeroporto removido com sucesso.', {
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
        <AirportForm
          {...modalProps}
          onClose={() => setModalProps({ open: false, airportId: undefined })}
        />
      </Box>
    </>
  );
};

export default AirportList;
