import React, { useState } from 'react';
import { Button, Drawer, IconButton, Box, Stack, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import Close from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import AirplaneSelect from '../../shared/selects/AirplaneSelect';
import UserSelect from '../../shared/selects/UserSelect';

export interface ScheduleFilterValues {
  airplanes: ValueLabelType[];
  pilots: ValueLabelType[];
}

interface ScheduleFilterProps {
  onFilter: (filter: ScheduleFilterValues) => void;
}

const ScheduleFilter = ({ onFilter }: ScheduleFilterProps) => {
  const [open, setOpen] = useState(false);

  const formik = useFormik<ScheduleFilterValues>({
    initialValues: {
      airplanes: [],
      pilots: [],
    },
    onSubmit: (values) => {
      onFilter(values);
      setOpen(false);
    },
    enableReinitialize: true,
  });

  const handleReset = () => {
    formik.resetForm();
    onFilter(formik.initialValues);
    setOpen(false);
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)} aria-label="filter">
        <FilterListIcon />
      </IconButton>
      <Drawer
        PaperProps={{
          padding: 2,
          sx: { width: { xs: '95%', md: 300 } },
        }}
        variant="temporary"
        onClose={() => setOpen(false)}
        anchor="right"
        open={open}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            px: 2,
            pb: 2,
            pt: 1,
          }}
        >
          <Box
            component="nav"
            sx={{
              flexGrow: 1,
            }}
          >
            <Stack
              sx={{ mb: 3 }}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={4}
            >
              <Typography variant="h6" sx={{ pl: 1 }}>
                Filter Schedule
              </Typography>
              <IconButton aria-label="close" size="large" onClick={() => setOpen(false)}>
                <Close fontSize="inherit" />
              </IconButton>
            </Stack>
            <form id="schedule-filter-form" noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <AirplaneSelect
                  multiple
                  fullWidth
                  label="Airplanes"
                  name="airplanes"
                  onBlur={formik.handleBlur}
                  value={formik.values.airplanes}
                  onChange={(_e, value) => {
                    formik.setFieldValue('airplanes', value);
                  }}
                />
                <UserSelect
                  multiple
                  fullWidth
                  label="Pilots"
                  name="pilots"
                  roles={['Comandante', 'Co-Piloto']}
                  onBlur={formik.handleBlur}
                  value={formik.values.pilots}
                  onChange={(_e, value) => {
                    formik.setFieldValue('pilots', value);
                  }}
                />
              </Stack>
            </form>
          </Box>
          <Box>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setOpen(false)} variant="text">
                Cancel
              </Button>
              <Button onClick={handleReset} variant="outlined">
                Reset
              </Button>
              <Button form="schedule-filter-form" type="submit" variant="contained">
                Filter
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ScheduleFilter;
