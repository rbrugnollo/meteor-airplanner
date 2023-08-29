import { Select, Props, GroupBase } from 'chakra-react-select';
import React, { useEffect, useState } from 'react';
import { RefCallBack } from 'react-hook-form';
import { searchByText } from '/imports/api/airplanes/methods/searchByText';

export interface AirplaneOption {
  value: string;
  label: string;
}

interface AirplaneSelectProps extends Props<AirplaneOption, false, GroupBase<AirplaneOption>> {
  readonly selectRef: RefCallBack;
}

const AirplaneSelect = (props: AirplaneSelectProps) => {
  const [options, setOptions] = useState<AirplaneOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchByText()
      .then((airplanes) => {
        setOptions(
          airplanes.map((airplane) => ({
            value: airplane._id!,
            label: `(${airplane.tailNumber}) ${airplane.name}`,
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
    ...rest
  } = props;

  return (
    <Select<AirplaneOption>
      isSearchable
      isLoading={isLoading}
      options={options}
      ref={selectRef}
      {...rest}
    />
  );
};

export default AirplaneSelect;
