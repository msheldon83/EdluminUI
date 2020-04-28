import * as React from "react";
import { Input } from "ui/components/form/input";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useDeferredState } from "hooks";

type Props = {
  options: string[]; // TODO:
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
  onClick: () => Promise<void>;
};

export const AutoCompleteSearch: React.FC<Props> = props => {
  const { t } = useTranslation();
  const setSearchText = props.setSearchText;

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    setSearchText(searchText);
  }, [setSearchText, searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  //AutoComplete Component with Action on Select

  return (
    <>
      <div style={{ width: 300 }}>
        <Autocomplete
          id="autocomplete-on-select"
          freeSolo
          //options={top100Films.map(option => option.title)} TODO:
          renderInput={params => (
            <TextField
              {...params}
              label="freeSolo"
              margin="normal"
              variant="outlined"
              //onClick={} TODO: Add current object to
            />
          )}
        />
      </div>
    </>
  );
};
