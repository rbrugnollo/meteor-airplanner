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
  ListItemIcon,
  ListItemText,
  MenuItem,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import AddIcon from '@mui/icons-material/Add';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/costCenters/publications/list';
import { CostCenter, CostCentersCollection } from '/imports/api/costCenters/collection';
import { Edit, Delete } from '@mui/icons-material';
import CostCenterForm from './CostCenterForm';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import { disable } from '/imports/api/costCenters/methods/disable';
import { enable } from '/imports/api/costCenters/methods/enable';
import { Meteor } from 'meteor/meteor';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

const CostCenterList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoaded, setIsLoaded] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canRemove, setCanRemove] = useState(false);
  const [modalProps, setModalProps] = useState<{ open: boolean; costCenterId?: string }>({
    open: false,
    costCenterId: undefined,
  });
  const isLoading = useSubscribe(list);
  const costCenters = useFind(() => CostCentersCollection.find());
  const columns = useMemo<MrtColumnDef<CostCenter>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
      },
    ],
    [],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));
  // Verify Permissions
  useEffect(() => {
    if (isLoaded) return;
    setIsLoaded(true);
    hasPermission({ permission: 'costCenters.update' }).then((hasPermission) => {
      setCanUpdate(hasPermission);
    });
    hasPermission({ permission: 'costCenters.remove' }).then((hasPermission) => {
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
              <Typography variant="h5">Centros de Custo</Typography>
              <div>
                <AuthorizedComponent permission="costCenters.insert">
                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => setModalProps({ open: true, costCenterId: undefined })}
                      variant="contained"
                    >
                      Adicionar
                    </Button>
                  </Stack>
                </AuthorizedComponent>
              </div>
            </Stack>
            <MaterialReactTable<CostCenter>
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
              data={costCenters}
              enableRowActions
              renderRowActionMenuItems={({ row, closeMenu }) => [
                <MenuItem
                  key={3}
                  disabled={!canUpdate}
                  onClick={() => {
                    closeMenu();
                    setModalProps({ open: true, costCenterId: row.original._id });
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
                      enqueueSnackbar('Centro de Custo removido com sucesso.', {
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
        <CostCenterForm
          {...modalProps}
          onClose={() => setModalProps({ open: false, costCenterId: undefined })}
        />
      </Box>
    </>
  );
};

export default CostCenterList;
