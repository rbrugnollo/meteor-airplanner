import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress, AutocompleteProps } from '@mui/material';
import { searchByText } from '/imports/api/users/methods/searchByText';
import { RoleName } from '/imports/api/users/collection';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';

interface UserSelectProps<Multiple extends boolean | undefined = false>
  extends Omit<
    AutocompleteProps<ValueLabelType, Multiple, false, false>,
    'options' | 'renderInput'
  > {
  readonly roles: RoleName[];
  readonly label?: React.ReactNode;
  readonly name: string;
}

const UserSelect = <Multiple extends boolean | undefined = false>({
  roles,
  name,
  label,
  ...rest
}: UserSelectProps<Multiple>) => {
  const [options, setOptions] = useState<ValueLabelType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchByText({ roles })
      .then((items) => {
        setOptions(
          items.map((item) => ({
            value: item._id ?? '',
            label: item.profile?.name ?? '',
          })),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Autocomplete<ValueLabelType, Multiple>
      {...rest}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      getOptionLabel={(option) => option.label}
      options={options}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name={name}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default UserSelect;
