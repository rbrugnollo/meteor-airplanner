import { AsyncSelect, AsyncProps, GroupBase } from 'chakra-react-select';
import React from 'react';
import { RefCallBack } from 'react-hook-form';
import { searchByText } from '/imports/api/airports/methods/searchByText';

export interface AirportOption {
  value: string;
  label: string;
}

interface AirportSelectProps extends AsyncProps<AirportOption, false, GroupBase<AirportOption>> {
  readonly selectRef: RefCallBack;
}

const AirportSelect = (props: AirportSelectProps) => {
  const loadOptions = (inputValue: string, callback: (options: AirportOption[]) => void) => {
    if (!inputValue || inputValue.length < 3) {
      callback([]);
    }
    searchByText({ q: inputValue })
      .then((airports) => airports)
      .then((airports) => {
        const options: AirportOption[] = airports.map((airport) => ({
          value: airport._id!,
          label: `(${airport.icao}) ${airport.name} - ${airport.city}`,
        }));
        callback(options);
      });
  };

  const { selectRef, loadOptions: _loadOptions, ...rest } = props;

  return <AsyncSelect<AirportOption> ref={selectRef} loadOptions={loadOptions} {...rest} />;
};

export default AirportSelect;
