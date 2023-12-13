import React, { useEffect } from 'react';
import * as Yup from 'yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Theme,
  TextField,
  Stack,
} from '@mui/material';
import { useFormik } from 'formik';
import { insert } from '/imports/api/events/methods/insert';
import { update } from '/imports/api/events/methods/update';
import { useSnackbar } from 'notistack';
import { Meteor } from 'meteor/meteor';
import { BaseCollectionTypes, Nullable } from '/imports/api/common/BaseCollection';
import { PilotVacationEvent } from '/imports/api/events/collection';
import UserSelect from '../../shared/selects/UserSelect';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { getOne } from '/imports/api/events/methods/getOne';

type ScheduleFormValues = Nullable<Omit<PilotVacationEvent, BaseCollectionTypes>>;

interface ScheduleFormProps {
  readonly eventId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

const ScheduleForm = ({ eventId, open, onClose, onSuccess }: ScheduleFormProps) => {
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<ScheduleFormValues>({
    initialValues: {
      type: 'Vacation',
      title: '',
      pilot: null,
      start: null,
      end: null,
    },
    validationSchema: Yup.object<ScheduleFormValues>().shape({
      title: Yup.string().required('Title é obrigatório'),
      pilot: Yup.object().required('Pilot é obrigatório'),
      start: Yup.date().required('Start é obrigatório'),
      end: Yup.date().required('End é obrigatório'),
    }),
    onSubmit: async (values) => {
      if (eventId) {
        await handleUpdate(values);
      } else {
        await handleInsert(values);
      }
    },
    enableReinitialize: true,
  });
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    formik.resetForm();
    if (open && eventId) loadEvent();
  }, [open]);

  const loadEvent = async () => {
    const event = await getOne({ _id: eventId! });
    if (event) {
      const pilotVacationEvent = event as PilotVacationEvent;
      const { _id, ...values } = pilotVacationEvent;
      formik.setValues(values);
    }
  };

  const handleInsert = async (data: ScheduleFormValues) => {
    try {
      const notNullData = data as Omit<PilotVacationEvent, BaseCollectionTypes>;
      await insert(notNullData);
      enqueueSnackbar('Event criado com sucesso.', { variant: 'success' });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  const handleUpdate = async (data: ScheduleFormValues) => {
    try {
      const notNullData = data as Omit<PilotVacationEvent, BaseCollectionTypes>;
      await update({
        _id: eventId!,
        ...notNullData,
      });
      enqueueSnackbar('Event atualizado com sucesso.', { variant: 'success' });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      PaperProps={{ sx: { width: 450 } }}
      open={open}
      onClose={() => {
        return;
      }}
      disableEscapeKeyDown
    >
      <DialogTitle>{eventId ? 'Update' : 'Adicionar'} Event</DialogTitle>
      <DialogContent>
        <form id="schedule-form" noValidate onSubmit={formik.handleSubmit}>
          <Stack sx={{ mt: 1 }} spacing={3}>
            <TextField
              fullWidth
              label="Type"
              name="type"
              InputProps={{
                readOnly: true,
              }}
              value={formik.values.type}
            />
            <TextField
              error={!!(formik.touched.title && formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              fullWidth
              label="Title"
              name="title"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.title}
            />
            <UserSelect
              fullWidth
              label="Pilot"
              name="pilot"
              roles={['Comandante', 'Co-Piloto']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('pilot', value);
              }}
              defaultValue={formik.initialValues.pilot ?? null}
              value={formik.values.pilot ?? null}
            />
            <DateTimePicker
              label="Start"
              value={formik.values.start ? dayjs(formik.values.start) : null}
              onChange={(value) => {
                formik.setFieldValue('start', value?.toDate());
              }}
              onClose={() => {
                formik.setFieldTouched('start', true);
              }}
              slotProps={{
                textField: {
                  error: !!(formik.touched.start && formik.errors.start),
                  helperText: formik.touched.start && formik.errors.start,
                },
              }}
            />
            <DateTimePicker
              label="End"
              value={formik.values.end ? dayjs(formik.values.end) : null}
              onChange={(value) => {
                formik.setFieldValue('end', value?.toDate());
              }}
              onClose={() => {
                formik.setFieldTouched('end', true);
              }}
              slotProps={{
                textField: {
                  error: !!(formik.touched.end && formik.errors.end),
                  helperText: formik.touched.end && formik.errors.end,
                },
              }}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="schedule-form" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleForm;
