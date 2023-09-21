import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress, AutocompleteProps } from '@mui/material';
import { searchByText } from '/imports/api/airports/methods/searchByText';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import { debounce } from 'lodash';

interface AirportSelectProps<Multiple extends boolean | undefined = false>
  extends Omit<
    AutocompleteProps<ValueLabelType, Multiple, false, false>,
    'options' | 'renderInput'
  > {
  readonly label?: React.ReactNode;
  readonly name: string;
  readonly helperText?: React.ReactNode;
  readonly error?: boolean;
}

const AirportSelect = <Multiple extends boolean | undefined = false>({
  name,
  label,
  error,
  helperText,
  ...rest
}: AirportSelectProps<Multiple>) => {
  const [options, setOptions] = useState<ValueLabelType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (inputValue: string) => {
    setIsLoading(true);
    searchByText({ q: inputValue })
      .then((items) => {
        let options = items.map((item) => ({
          value: item._id!,
          label: `(${item.icao}) ${item.name} - ${item.city}`,
        }));
        if (rest.value) {
          if (rest.multiple) {
            const value = rest.value as ValueLabelType[];
            options = [...options, ...value];
          } else {
            const value = rest.value as ValueLabelType;
            options = [...options, value];
          }
        }
        setOptions(options);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const dHandleSearch = debounce(handleSearch, 500);

  return (
    <Autocomplete<ValueLabelType, Multiple>
      {...rest}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      getOptionLabel={(option) => option.label}
      options={options}
      loading={isLoading}
      onInputChange={(_, value, reason) => {
        if (reason === 'input') {
          dHandleSearch(value);
          console.log(value);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
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

export default AirportSelect;
