import React, { useState } from 'react';
import {
  Button,
  Drawer,
  InputAdornment,
  TextField,
  IconButton,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import AirplaneSelect from '../../shared/selects/AirplaneSelect';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import { Dayjs } from 'dayjs';

export interface FlightListFilterValues {
  search?: string;
  airplane: ValueLabelType | null;
  date: Dayjs | null;
}

interface FlightListFilterProps {
  onFilter: (filter: FlightListFilterValues) => void;
}

const FlightListFilter = ({ onFilter }: FlightListFilterProps) => {
  const [open, setOpen] = useState(false);

  const formik = useFormik<FlightListFilterValues>({
    initialValues: {
      search: '',
      airplane: null,
      date: null,
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
                Filter Flights
              </Typography>
              <IconButton aria-label="close" size="large" onClick={() => setOpen(false)}>
                <Close fontSize="inherit" />
              </IconButton>
            </Stack>
            <form id="flight-list-filter-form" noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Search"
                  name="search"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.search}
                />
                <AirplaneSelect
                  fullWidth
                  label="Airplane"
                  name="airplane"
                  onBlur={formik.handleBlur}
                  value={formik.values.airplane}
                  onChange={(_e, value) => {
                    formik.setFieldValue('airplane', value);
                  }}
                />
                <DatePicker
                  label="Date"
                  value={formik.values.date}
                  onChange={(value) => {
                    formik.setFieldValue('date', value);
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
              <Button form="flight-list-filter-form" type="submit" variant="contained">
                Filter
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default FlightListFilter;
