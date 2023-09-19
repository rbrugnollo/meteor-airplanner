import { Select, Props, GroupBase } from 'chakra-react-select';
import React, { useEffect, useState } from 'react';
import { RefCallBack } from 'react-hook-form';
import { getOne } from '/imports/api/airplanes/methods/getOne';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import { RoleName } from '/imports/api/users/collection';
import { searchByText } from '/imports/api/users/methods/searchByText';

export interface PilotOption {
  value: string;
  label: string;
}

interface PilotSelectProps<IsMulti extends boolean = false>
  extends Props<PilotOption, IsMulti, GroupBase<PilotOption>> {
  readonly selectRef: RefCallBack;
  readonly airplaneId: string;
  readonly roles: RoleName[];
  readonly onOptionsLoaded?: (result: {
    captain?: ValueLabelType;
    firstOfficer?: ValueLabelType;
    pilots?: ValueLabelType[];
  }) => void;
}

const PilotSelect = <IsMulti extends boolean = false>({
  airplaneId,
  selectRef,
  roles,
  onOptionsLoaded,
  isLoading: _isLoading,
  isSearchable: _isSearchable,
  options: _options,
  ...rest
}: PilotSelectProps<IsMulti>) => {
  const [options, setOptions] = useState<PilotOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, [airplaneId]);

  async function fetchOptions() {
    setOptions([]);
    if (!airplaneId) return;

    setIsLoading(true);
    const airplane = await getOne({ _id: airplaneId });
    if (airplane?.pilots) {
      const users = await searchByText({ roles, userIds: airplane.pilots.map((m) => m.value) });
      setOptions(
        users.map((item) => ({
          value: item._id ?? '',
          label: item.profile?.name ?? '',
        })),
      );
      onOptionsLoaded?.({
        captain: airplane.captain,
        firstOfficer: airplane.firstOfficer,
        pilots: airplane.pilots,
      });
    }
    setIsLoading(false);
  }

  return (
    <Select<PilotOption, IsMulti, GroupBase<PilotOption>>
      isSearchable
      isLoading={isLoading}
      options={options}
      ref={selectRef}
      {...rest}
    />
  );
};

export default PilotSelect;
