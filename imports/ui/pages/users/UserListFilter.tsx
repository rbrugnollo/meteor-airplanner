import React, { useState } from 'react';
import {
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import Close from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import { RoleNames } from '/imports/api/users/collection';

export interface UserListFilterValues {
  role?: string;
}

interface UserListFilterProps {
  onFilter: (filter: UserListFilterValues) => void;
}

const UserListFilter = ({ onFilter }: UserListFilterProps) => {
  const [open, setOpen] = useState(false);

  const formik = useFormik<UserListFilterValues>({
    initialValues: {
      role: '',
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
                Filtrar Usuários
              </Typography>
              <IconButton aria-label="close" size="large" onClick={() => setOpen(false)}>
                <Close fontSize="inherit" />
              </IconButton>
            </Stack>
            <form id="user-list-filter-form" noValidate onSubmit={formik.handleSubmit}>
              <FormControl fullWidth variant="filled">
                <InputLabel id="user-filter-role-label">Função</InputLabel>
                <Select
                  labelId="user-filter-role-label"
                  name="role"
                  onBlur={formik.handleBlur}
                  defaultValue={formik.initialValues.role}
                  onChange={formik.handleChange}
                  value={formik.values.role}
                >
                  {Object.entries(RoleNames).map(([_, roleName]) => (
                    <MenuItem key={roleName} value={roleName}>
                      {roleName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <Button form="user-list-filter-form" type="submit" variant="contained">
                Filtrar
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default UserListFilter;
