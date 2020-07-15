import * as React from "react";
import { Isomorphism } from "@atomic-object/lenses";
import {
  SelectNew,
  SelectProps,
  OptionType,
} from "ui/components/form/select-new";

// Equivalent of OptionType, but supports a generic type for value
export type IsoOptionType<InterpretedType> = {
  label: string;
  value: InterpretedType;
};

// Takes an isomorphism from RawType (a subset of value field types for options)
// to an interpreted type, and returns an isomorphism from OptionType to
// IsoOptionType of the interpreted type
function optionTypeIsomorphism<
  RawType extends string | number,
  InterpretedType
>(
  baseIso: Isomorphism<RawType, InterpretedType>
): Isomorphism<OptionType, IsoOptionType<InterpretedType>> {
  return {
    to: rawOption => ({
      label: rawOption.label,
      value: baseIso.to(rawOption.value as RawType),
    }),
    from: isoOption => ({
      label: isoOption.label,
      value: baseIso.from(isoOption.value),
    }),
  };
}

// Same as SelectProps<T>, but:
//  takes in an isomorphism,
//  all OptionTypes are replaced with IsoOptionTypes, and
//  no multiple, as that's passed in based on which select is used
export type IsoSelectProps<
  T extends boolean,
  RawType extends string | number,
  InterpretedType
> = Omit<
  SelectProps<T>,
  "options" | "value" | "onChange" | "onSort" | "multiple"
> & {
  options: Array<IsoOptionType<InterpretedType>>;
  value: T extends true ? Array<InterpretedType> : InterpretedType;
  onChange?: (
    value: T extends true ? Array<InterpretedType> : InterpretedType
  ) => void;
  onSort?: (
    option1: IsoOptionType<InterpretedType>,
    option2: IsoOptionType<InterpretedType>
  ) => 1 | -1 | 0;
  iso: Isomorphism<RawType, InterpretedType>;
};

// Simpler to separate the select into two:
// one for selecting one value (IsoSelectOne)
// and one for selecting many values (IsoSelectMany)

export function IsoSelectOne<RawType extends string | number, InterpretedType>(
  props: IsoSelectProps<false, RawType, InterpretedType>
) {
  const { options, value, onChange, onSort, iso: baseIso } = props;
  const optionIso = optionTypeIsomorphism(baseIso);

  return (
    <SelectNew
      {...props}
      multiple={false}
      options={options.map(optionIso.from)}
      value={optionIso.from(options.find(o => o.value == value) ?? options[0])}
      onChange={
        onChange
          ? rawValue => onChange(optionIso.to(rawValue).value)
          : undefined
      }
      onSort={
        onSort
          ? (rawValue1, rawValue2) =>
              onSort(optionIso.to(rawValue1), optionIso.to(rawValue2))
          : undefined
      }
    />
  );
}

export function IsoSelectMany<RawType extends string | number, InterpretedType>(
  props: IsoSelectProps<true, RawType, InterpretedType>
) {
  const { options, value, onChange, onSort, iso: baseIso } = props;
  const optionIso = optionTypeIsomorphism(baseIso);

  return (
    <SelectNew
      {...props}
      multiple={true}
      options={options.map(optionIso.from)}
      value={options.filter(o => value.includes(o.value)).map(optionIso.from)}
      onChange={
        onChange
          ? rawValue => onChange(rawValue.map(v => optionIso.to(v).value))
          : undefined
      }
      onSort={
        onSort
          ? (rawValue1, rawValue2) =>
              onSort(optionIso.to(rawValue1), optionIso.to(rawValue2))
          : undefined
      }
    />
  );
}
