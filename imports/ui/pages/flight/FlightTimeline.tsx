/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { COLLECTION_NAME as FlightsCollectionName } from '/imports/api/flights/collection';
import { list } from '/imports/api/auditLogs/publications/list';
import {
  TableContainer,
  Paper,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Collapse,
  IconButton,
  Grid,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { AuditLog, AuditLogsCollection } from '/imports/api/auditLogs/collection';
import { deepDiff } from '/imports/api/lib/deepDiff';
import { isArray, isEmpty } from 'lodash';
import { useTheme } from '@mui/material/styles';

interface FlightTimelineProps {
  readonly flightId: string;
}

const FlightTimeline = ({ flightId }: FlightTimelineProps) => {
  useSubscribe(() => {
    return list({ docId: flightId, collection: FlightsCollectionName });
  });
  const data = useFind(
    () =>
      AuditLogsCollection.find(
        { docId: flightId, collection: FlightsCollectionName },
        {
          sort: { createdAt: -1 },
          projection: { _id: 1, doc: 1, docId: 1, collection: 1, createdAt: 1 },
        },
      ),
    [],
  );
  return (
    <div>
      <Typography sx={{ fontSize: '14px', paddingTop: '20px' }} variant="h6">
        Histórico de Alterações
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ width: '100%', tableLayout: 'fixed' }} size="small">
          <TableBody>
            {data.map((row, i) => (
              <Row
                key={row._id}
                log={row}
                logBefore={i === data.length - 1 ? undefined : data[i + 1]}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const getTitle = (key: string) => {
  const map = [
    ['airplane', 'Aeronave'],
    ['airplane.label', 'Aeronave'],
    ['scheduledDepartureDateTime', 'Decolagem agendada'],
    ['dateConfirmed', 'Data Confirmada'],
    ['timeConfirmed', 'Hora Confirmada'],
    ['scheduledArrivalDateTime', 'Chegada agendada'],
    ['estimatedDuration', 'Duração estimada'],
    ['origin', 'Origem'],
    ['origin.label', 'Origem'],
    ['destination', 'Destino'],
    ['destination.label', 'Destino'],
    ['handlingDuration', 'Handling'],
    ['published', 'Publicado'],
    ['maintenance', 'Manutenção'],
    ['authorized', 'Autorizado'],
    ['captain', 'Comandante'],
    ['captain.label', 'Comandante'],
    ['captainInReserve', 'Comandante em Reserva'],
    ['firstOfficer', 'Co-Piloto'],
    ['firstOfficer.label', 'Co-Piloto'],
    ['firstOfficerInReserve', 'Co-Piloto em Reserva'],
    ['passengers', 'Passageiros'],
    ['requesters', 'Solicitantes'],
    ['notes', 'Observações'],
  ];
  return (
    map.find((item) => item[0] === key)?.[1] ??
    map.find((item) => key.includes(item[0]))?.[1] ??
    null
  );
};

const getValue = (value: any): string => {
  if (value === undefined || value === null) return ' ';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value.getMonth === 'function') return dayjs(value).format('DD/MM HH:mm');
  if (typeof value.label === 'string') return value.label;
  if (typeof value.percentage === 'number')
    return `(${value.costCenter.label}) ${value.requester.label} - ${value.percentage}%`;
  if (isArray(value)) {
    return value.map(getValue).join(' | ');
  }
  return value.toString();
};

const Row = ({ log, logBefore }: { log: AuditLog; logBefore?: AuditLog }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const normalize = (doc: any): any => ({
    ...doc,
    requesters:
      doc?.requesters
        ?.map((r: any) => `(${r.costCenter?.label}) ${r.requester?.label} - ${r.percentage}%`)
        .sort()
        .join(', ') ?? '',
    passengers:
      doc?.passengers
        ?.map((m: any) => m.label)
        .sort()
        .join(', ') ?? '',
  });

  const diff = logBefore ? deepDiff(normalize(logBefore.doc), normalize(log.doc)) : null;

  const tableBody = (
    isEmpty(diff)
      ? Object.entries(log.doc!)
          .map(([key, value]: [string, any]) => (getTitle(key) && value ? [key, value] : null))
          .filter((f) => f)
          .map((m, i) => {
            if (!m) return null;
            const [key, value] = m;
            return (
              <TableRow key={`${log._id}${key}`}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={
                    i % 2 > 0
                      ? {
                          backgroundColor: theme.palette.action.hover,
                          fontSize: { xs: '11px', md: '12px' },
                        }
                      : { fontSize: { xs: '11px', md: '12px' } }
                  }
                >
                  {getTitle(key)}
                </TableCell>
                <TableCell
                  sx={{
                    py: 0,
                    backgroundColor: theme.palette.success.light,
                    fontSize: { xs: '11px', md: '12px' },
                  }}
                >
                  <Grid container spacing={0}>
                    <Grid item xs={12}>
                      <Box bgcolor={theme.palette.success.light} sx={{ p: '6px' }}>
                        {getValue(value)}
                      </Box>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            );
          })
      : Object.entries(diff)
          .map(([key, value]: [string, any]) => (getTitle(key) && value ? [key, value] : null))
          .filter((f) => f)
          .map((m, i) => {
            if (!m) return null;
            const [key, value] = m;
            return (
              <TableRow key={`${log._id}${key}`}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={
                    i % 2 > 0
                      ? {
                          backgroundColor: theme.palette.action.hover,
                          fontSize: { xs: '11px', md: '12px' },
                        }
                      : { fontSize: { xs: '11px', md: '12px' } }
                  }
                >
                  {getTitle(key)}
                </TableCell>
                <TableCell sx={{ py: { xs: 0.5, md: 0 }, fontSize: { xs: '11px', md: '12px' } }}>
                  <Grid container spacing={0.5}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: '6px' }} bgcolor={theme.palette.warning.light}>
                        {getValue(value.from)}&nbsp;
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: '6px' }} bgcolor={theme.palette.success.light}>
                        {getValue(value.to)}
                      </Box>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            );
          })
  ).filter((f) => f);

  return isEmpty(tableBody) ? null : (
    <React.Fragment>
      <TableRow sx={{ backgroundColor: 'neutral.200', '& > *': { borderBottom: 'unset' } }}>
        <TableCell
          component="th"
          sx={{ cursor: 'pointer' }}
          scope="row"
          onClick={() => setOpen(!open)}
        >
          <Grid container columns={36} spacing={{ xs: 1, md: 2 }}>
            <Grid item xs={8} md={3}>
              <IconButton sx={{ padding: 0, pr: 2 }} aria-label="expand row" size="small">
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontSize: { xs: '11px', md: '12px' } }}
                component="span"
              >
                {dayjs(log.createdAt).format('DD/MM HH:mm')}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: { xs: '11px', md: '12px' } }}
                component="span"
              >
                {(log.doc! as any).updatedByLabel}
              </Typography>
            </Grid>
          </Grid>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableBody>{tableBody}</TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default FlightTimeline;
