import React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import { useColorMode } from '@chakra-ui/react';
import { RefCallBack } from 'react-hook-form';

import 'react-datepicker/dist/react-datepicker.css';
import './date-picker.css';

interface DatePicker<
  CustomModifierNames extends string = never,
  WithRange extends boolean | undefined = undefined,
> extends ReactDatePickerProps<CustomModifierNames, WithRange> {
  readonly datepickerRef: RefCallBack;
}

const DatePicker = <
  CustomModifierNames extends string = never,
  WithRange extends boolean | undefined = undefined,
>({
  datepickerRef,
  selected,
  onChange,
  isClearable = false,
  showPopperArrow = false,
  ...props
}: DatePicker<CustomModifierNames, WithRange>) => {
  const isLight = useColorMode().colorMode === 'light';
  return (
    // if you don't want to use chakra's colors or you just wwant to use the original ones,
    // set className to "light-theme-original" ↓↓↓↓
    <div className={isLight ? 'light-theme' : 'dark-theme'}>
      <ReactDatePicker
        ref={datepickerRef}
        selected={selected}
        onChange={onChange}
        isClearable={isClearable}
        showPopperArrow={showPopperArrow}
        className="react-datapicker__input-text"
        {...props}
      />
    </div>
  );
};

export default DatePicker;
