import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  AutocompleteProps,
  createFilterOptions,
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
  AutocompleteValue,
} from '@mui/material';
import { searchByText } from '/imports/api/users/methods/searchByText';
import { RoleName } from '/imports/api/users/collection';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import UserForm, { UserFormProps } from '../../pages/users/UserForm';
import { getOne } from '/imports/api/users/methods/getOne';

interface TypeWithInput extends ValueLabelType {
  readonly inputValue?: string;
}

interface SuccessDataProps<
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> {
  readonly event: React.SyntheticEvent<Element, Event>;
  readonly value: AutocompleteValue<TypeWithInput, Multiple, DisableClearable, FreeSolo>;
  readonly reason: AutocompleteChangeReason;
  readonly details?: AutocompleteChangeDetails<TypeWithInput>;
}

interface UserModalProps<
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> extends Omit<UserFormProps, 'onClose' | 'onSuccess'> {
  readonly successData?: SuccessDataProps<Multiple, DisableClearable, FreeSolo>;
}

const optionsFilter = createFilterOptions<TypeWithInput>();

interface UserSelectProps<
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> extends Omit<
    AutocompleteProps<TypeWithInput, Multiple, DisableClearable, FreeSolo>,
    'options' | 'renderInput'
  > {
  readonly roles: RoleName[];
  readonly label?: React.ReactNode;
  readonly name: string;
  readonly helperText?: React.ReactNode;
  readonly error?: boolean;
  readonly filter?: (option: ValueLabelType) => boolean;
}

const UserSelect = <
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>({
  roles,
  name,
  label,
  error,
  helperText,
  filter,
  ...rest
}: UserSelectProps<Multiple, DisableClearable, FreeSolo>) => {
  const [options, setOptions] = useState<ValueLabelType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalProps, setModalProps] = useState<
    UserModalProps<Multiple, DisableClearable, FreeSolo>
  >({
    open: false,
    newUser: undefined,
    successData: undefined,
  });

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

  function addNewUser(
    newValue: TypeWithInput | string,
    successData: SuccessDataProps<Multiple, DisableClearable, FreeSolo>,
  ) {
    setModalProps({
      open: true,
      newUser: {
        name: typeof newValue === 'string' ? newValue : newValue.inputValue!,
        email: '',
        roles: roles.length ? roles : ['Passageiro'],
      },
      successData,
    });
  }

  async function handleUserAdded(userId: string) {
    const user = await getOne({ _id: userId });
    if (user) {
      const newValue = {
        value: user._id ?? '',
        label: user.profile?.name ?? '',
      };
      setOptions([...options, newValue]);
      if (rest.multiple) {
        rest.onChange?.(
          modalProps.successData!.event,
          [...(rest.value as TypeWithInput[]), newValue] as unknown as AutocompleteValue<
            TypeWithInput,
            Multiple,
            DisableClearable,
            FreeSolo
          >,
          modalProps.successData!.reason,
          modalProps.successData!.details,
        );
      } else {
        rest.onChange?.(
          modalProps.successData!.event,
          newValue as unknown as AutocompleteValue<
            TypeWithInput,
            Multiple,
            DisableClearable,
            FreeSolo
          >,
          modalProps.successData!.reason,
          modalProps.successData!.details,
        );
      }
    }
    setModalProps({ open: false, newUser: undefined, successData: undefined });
  }

  return (
    <>
      <Autocomplete<TypeWithInput, Multiple, DisableClearable, FreeSolo>
        {...rest}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionLabel={(option) => {
          // e.g. value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.label;
        }}
        options={filter ? options.filter(filter!) : options}
        filterOptions={(options, params) => {
          const filtered = optionsFilter(options, params);

          if (rest.freeSolo) {
            // Suggest the creation of a new value
            const { inputValue } = params;
            const isExisting = options.some((option) => inputValue === option.label);
            if (inputValue !== '' && !isExisting) {
              filtered.push({
                inputValue,
                value: '',
                label: `Adicionar "${inputValue}"`,
              });
            }
          }
          return filtered;
        }}
        onChange={(event, value, reason, details) => {
          let addNew = false;
          if (rest.freeSolo) {
            if (rest.multiple) {
              const values = value as (TypeWithInput | string)[];
              const newValue = values.find((m) => typeof m === 'string' || m.inputValue);
              if (newValue !== undefined) {
                addNew = true;
                addNewUser(newValue, {
                  event,
                  value,
                  reason,
                  details,
                });
              }
            } else {
              const newValue = value as TypeWithInput | string | undefined;
              if (newValue !== undefined) {
                addNew = true;
                addNewUser(newValue, {
                  event,
                  value,
                  reason,
                  details,
                });
              }
            }
          }
          if (!addNew) rest.onChange?.(event, value, reason, details);
        }}
        renderOption={(props, option) => <li {...props}>{option.label}</li>}
        loading={isLoading}
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
      <UserForm
        {...modalProps}
        onClose={() => setModalProps({ open: false, newUser: undefined, successData: undefined })}
        onSuccess={handleUserAdded}
      />
    </>
  );
};

export default UserSelect;
