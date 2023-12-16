/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { getTimeline } from '/imports/api/flights/methods/getTimeline';
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
import { AuditLog } from '/imports/api/auditLogs/collection';
import { deepDiff } from '/imports/api/lib/deepDiff';
import { isArray, isEmpty } from 'lodash';
import { useTheme } from '@mui/material/styles';

interface FlightTimelineProps {
  readonly flightId: string;
}

const FlightTimeline = ({ flightId }: FlightTimelineProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [_loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditLog[]>([]);
  useEffect(() => {
    fetchFlightTimeline();
  }, []);

  async function fetchFlightTimeline() {
    setLoading(true);
    try {
      const result = await getTimeline({ flightId });
      setData(result);
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
    setLoading(false);
  }
  return (
    <div>
      <Typography variant="h6" component="h2">
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
  return map.find((item) => item[0] === key)?.[1] || null;
};

const getValue = (value: any) => {
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value.getMonth === 'function') return dayjs(value).format('DD/MM HH:mm');
  if (typeof value.label === 'string') return value.label;
  if (isArray(value)) {
    return value
      .map((m) => {
        if (typeof m.label === 'string') return m.label;
        if (typeof m.percentage === 'number')
          return `(${m.costCenter.label}) ${m.requester.label} - ${m.percentage}%`;
      })
      .join(' | ');
  }
  return value.toString();
};

const Row = ({ log, logBefore }: { log: AuditLog; logBefore?: AuditLog }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const diff = logBefore ? deepDiff(logBefore.doc, log.doc) : null;

  const tableBody = (
    isEmpty(diff)
      ? Object.entries(log.doc!).map(([key, value]: [string, any], i) =>
          getTitle(key) && value ? (
            <TableRow key={`${log._id}${key}`}>
              <TableCell
                component="th"
                scope="row"
                sx={i % 2 > 0 ? { backgroundColor: theme.palette.action.hover } : {}}
              >
                {getTitle(key)}
              </TableCell>
              <TableCell sx={{ py: 0, backgroundColor: theme.palette.success.light }}>
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <Box bgcolor={theme.palette.success.light} sx={{ p: '6px' }}>
                      {getValue(value)}
                    </Box>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
          ) : null,
        )
      : Object.entries(diff).map(
          ([key, value]: [string, any], i) =>
            getTitle(key) &&
            value && (
              <TableRow
                key={`${log._id}${key}`}
                sx={i % 2 > 0 ? { backgroundColor: theme.palette.action.hover } : {}}
              >
                <TableCell component="th" scope="row">
                  {getTitle(key)}
                </TableCell>
                <TableCell sx={{ py: { xs: 0.5, md: 0 } }}>
                  <Grid container spacing={0.5}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: '6px' }} bgcolor={theme.palette.warning.light}>
                        {getValue(value.from)}
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
            ),
        )
  ).filter((f) => f);

  return isEmpty(tableBody) ? null : (
    <React.Fragment>
      <TableRow sx={{ backgroundColor: 'neutral.300', '& > *': { borderBottom: 'unset' } }}>
        <TableCell
          component="th"
          sx={{ cursor: 'pointer' }}
          scope="row"
          onClick={() => setOpen(!open)}
        >
          <Grid container columns={24} spacing={{ xs: 1, md: 2 }}>
            <Grid item xs={8} md={2}>
              <IconButton sx={{ padding: 0, pr: 2 }} aria-label="expand row" size="small">
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontSize: { xs: 'small', md: 'normal' } }}
                component="span"
              >
                {dayjs(log.createdAt).format('DD/MM HH:mm')}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: { xs: 'small', md: 'normal' } }}
                component="span"
              >
                {(log.doc! as any).updatedByLabel} Rafael Brugnollo
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
