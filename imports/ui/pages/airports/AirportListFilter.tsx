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
import { useFormik } from 'formik';

export interface AirportListFilterValues {
  search?: string;
}

interface AirportListFilterProps {
  onFilter: (filter: AirportListFilterValues) => void;
}

const AirportListFilter = ({ onFilter }: AirportListFilterProps) => {
  const [open, setOpen] = useState(false);

  const formik = useFormik<AirportListFilterValues>({
    initialValues: {
      search: '',
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
                Filtrar Aeroportos
              </Typography>
              <IconButton aria-label="close" size="large" onClick={() => setOpen(false)}>
                <Close fontSize="inherit" />
              </IconButton>
            </Stack>
            <form id="airport-list-filter-form" noValidate onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                label="Procurar"
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
            </form>
          </Box>
          <Box>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setOpen(false)} variant="text">
                Cancelar
              </Button>
              <Button onClick={handleReset} variant="outlined">
                Resetar
              </Button>
              <Button form="airport-list-filter-form" type="submit" variant="contained">
                Filtrar
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AirportListFilter;
