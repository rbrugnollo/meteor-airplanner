import React, { useMemo, useRef, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef as MrtColumnDef,
  MRT_Virtualizer as MrtVirtualizer,
} from 'material-react-table';
import { Box, Container, Stack, Typography, useMediaQuery, Theme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/notifications/publications/list';
import { Notification, NotificationsCollection } from '/imports/api/notifications/collection';
import { Mongo } from 'meteor/mongo';

const NotificationList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef =
    useRef<MrtVirtualizer<HTMLDivElement, HTMLTableRowElement>>(null);
  const [options, setOptions] = useState<Mongo.Options<Notification>>({
    sort: { createdAt: -1 },
    limit: 50,
  });
  const isLoading = useSubscribe(() => {
    return list({ options });
  });
  const notifications = useFind(() => NotificationsCollection.find(), [options]);
  const columns = useMemo<MrtColumnDef<Notification>[]>(
    () => [
      {
        accessorKey: '_id',
        header: '',
      },
    ],
    [],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));

  const fetchMoreOnBottomReached = (containerRefElement?: HTMLDivElement | null) => {
    if (containerRefElement) {
      const currentLimit = options?.limit ?? 0;
      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      if (scrollHeight - scrollTop - clientHeight < 400 && !isLoading() && currentLimit < 500) {
        setOptions({ ...options, limit: currentLimit + 50 });
      }
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
              <Typography variant="h5">Notificações</Typography>
            </Stack>
            <MaterialReactTable<Notification>
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
              data={notifications}
              muiTableContainerProps={{
                ref: tableContainerRef,
                sx: { maxHeight: lgUp ? 'calc(100vh - 90px)' : 'calc(100vh - 130px)' },
                onScroll: (event: React.UIEvent<HTMLDivElement>) =>
                  fetchMoreOnBottomReached(event.target as HTMLDivElement),
              }}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default NotificationList;
