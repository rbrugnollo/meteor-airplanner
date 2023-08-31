import { Select, Props, GroupBase } from 'chakra-react-select';
import React, { useEffect, useState } from 'react';
import { RefCallBack } from 'react-hook-form';
import { searchByText } from '/imports/api/users/methods/searchByText';

export interface UserOption {
  value: string;
  label: string;
}

interface UserSelectProps<IsMulti extends boolean = false>
  extends Props<UserOption, IsMulti, GroupBase<UserOption>> {
  readonly selectRef: RefCallBack;
  readonly roles: string[];
}

const UserSelect = <IsMulti extends boolean = false>(props: UserSelectProps<IsMulti>) => {
  const [options, setOptions] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchByText({ roles: props.roles })
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

  const {
    selectRef,
    isLoading: _isLoading,
    isSearchable: _isSearchable,
    options: _options,
    roles: _roles,
    ...rest
  } = props;

  return (
    <Select<UserOption, IsMulti, GroupBase<UserOption>>
      isSearchable
      isLoading={isLoading}
      options={options}
      ref={selectRef}
      {...rest}
    />
  );
};

export default UserSelect;
