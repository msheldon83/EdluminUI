import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { OptionType } from "ui/components/form/select-new";
import TextField from "@material-ui/core/TextField";
import { Input } from "ui/components/form/input";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useDeferredState } from "hooks";

type Props = {
  options: OptionType[];
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
  onClick: (id: string, orgId?: string) => void;
  useLabel?: boolean;
  placeholder?: string;
  searchText?: string | undefined;
  orgId?: string;
};

export const AutoCompleteSearch: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const setSearchText = props.setSearchText;

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 300);
  useEffect(() => {
    setSearchText(searchText);
  }, [setSearchText, searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  return (
    <>
      {props.useLabel && <div className={classes.boldFont}>{t("Search")}</div>}

      <Autocomplete
        id="autocomplete-on-select"
        freeSolo
        selectOnFocus
        clearOnEscape
        autoComplete={true}
        getOptionLabel={o => {
          return o.label;
        }}
        options={props.options}
        renderInput={params => (
          <TextField
            {...params}
            label={props.placeholder}
            margin="normal"
            variant="outlined"
            className={classes.searchInput}
            onChange={(e: any) => updateSearchText(e)}
          />
        )}
        onChange={(e: React.ChangeEvent<{}>, selection: OptionType | null) => {
          const selectedValue = selection?.value ?? "";

          if (selectedValue !== "") {
            const result = props?.orgId
              ? props.onClick(selectedValue.toString(), props?.orgId)
              : props.onClick(selectedValue.toString());
          }
          props.options.length = 0;
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  searchInput: {
    width: "100%",
    height: "70%",
  },
  boldFont: {
    fontWeight: 600,
  },
}));
