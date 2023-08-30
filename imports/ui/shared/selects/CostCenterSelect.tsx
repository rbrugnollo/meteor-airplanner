import { Select, Props, GroupBase } from 'chakra-react-select';
import React, { useEffect, useState } from 'react';
import { RefCallBack } from 'react-hook-form';
import { searchByText } from '/imports/api/costCenters/methods/searchByText';

export interface CostCenterOption {
  value: string;
  label: string;
}

interface CostCenterSelectProps
  extends Props<CostCenterOption, false, GroupBase<CostCenterOption>> {
  readonly selectRef: RefCallBack;
}

const CostCenterSelect = (props: CostCenterSelectProps) => {
  const [options, setOptions] = useState<CostCenterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchByText()
      .then((costCenters) => {
        setOptions(
          costCenters.map((costCenter) => ({
            value: costCenter._id!,
            label: costCenter.name,
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
    <Select<CostCenterOption>
      isSearchable
      isLoading={isLoading}
      options={options}
      ref={selectRef}
      {...rest}
    />
  );
};

export default CostCenterSelect;
