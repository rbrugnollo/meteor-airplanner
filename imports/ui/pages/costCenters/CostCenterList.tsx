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
  ListItemIcon,
  ListItemText,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/costCenters/publications/list';
import { CostCenter, CostCentersCollection } from '/imports/api/costCenters/collection';
import { Edit, Delete } from '@mui/icons-material';
import CostCenterForm from './CostCenterForm';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import useHasPermission from '../../shared/hooks/useHasPermission';

const CostCenterList = () => {
  const [modalProps, setModalProps] = useState<{ open: boolean; costCenterId?: string }>({
    open: false,
    costCenterId: undefined,
  });
  const [_canUpdateLoading, canUpdate] = useHasPermission('costCenters.update');
  const [_canRemoveLoading, canRemove] = useHasPermission('costCenters.remove');
  const isLoading = useSubscribe(list);
  const costCenters = useFind(() => CostCentersCollection.find());
  const columns = useMemo<MrtColumnDef<CostCenter>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
    ],
    [],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));

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
              <Typography variant="h5">Cost Centers</Typography>
              <div>
                <AuthorizedComponent permission="costCenters.insert">
                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => setModalProps({ open: true, costCenterId: undefined })}
                      variant="contained"
                    >
                      Add
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
                  <ListItemText>Edit</ListItemText>
                </MenuItem>,
                <MenuItem
                  key={2}
                  disabled={!canRemove}
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
        <CostCenterForm
          {...modalProps}
          onClose={() => setModalProps({ open: false, costCenterId: undefined })}
        />
      </Box>
    </>
  );
};

export default CostCenterList;
