import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress, AutocompleteProps } from '@mui/material';
import { searchByText } from '/imports/api/airplanes/methods/searchByText';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';

interface AirplaneSelectProps<Multiple extends boolean | undefined = false>
  extends Omit<
    AutocompleteProps<ValueLabelType, Multiple, false, false>,
    'options' | 'renderInput'
  > {
  readonly label?: React.ReactNode;
  readonly name: string;
  readonly helperText?: React.ReactNode;
  readonly required?: boolean;
  readonly error?: boolean;
}

const AirplaneSelect = <Multiple extends boolean | undefined = false>({
  name,
  label,
  error,
  helperText,
  required,
  ...rest
}: AirplaneSelectProps<Multiple>) => {
  const [options, setOptions] = useState<ValueLabelType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchByText()
      .then((items) => {
        setOptions(
          items.map((item) => ({
            value: item._id!,
            label: `(${item.tailNumber}) ${item.name}`,
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
          required={required}
          label={label}
          name={name}
          error={error}
          helperText={helperText}
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

export default AirplaneSelect;
