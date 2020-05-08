import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { OptionType } from "ui/components/form/select-new";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useDeferredState } from "hooks";

type Props = {
  options: OptionType[];
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
  onClick: (id: string, name?: string) => void;
  useLabel?: boolean;
  placeholder?: string;
  searchText?: string | undefined;
  includeName?: boolean;
};

export const AutoCompleteSearch: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const setSearchText = props.setSearchText;

  const [resetComponent, setResetComponent] = React.useState<number>(1);

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
        selectOnFocus={true}
        clearOnEscape
        key={resetComponent}
        autoComplete
        getOptionLabel={o => {
          return o.label;
        }}
        options={props.options}
        renderInput={params => (
          <TextField
            {...params}
            placeholder={props.placeholder}
            margin="normal"
            variant="outlined"
            className={classes.searchInput}
            inputProps={{
              ...params.inputProps,
              className: classes.inputHeight,
            }}
            onChange={(e: any) => updateSearchText(e)}
          />
        )}
        onChange={(e: React.ChangeEvent<{}>, selection: OptionType | null) => {
          const selectedValue = selection?.value ?? "";

          setSearchText(undefined);

          if (selectedValue !== "") {
            setResetComponent(Math.random());

            const result = props.includeName
              ? props.onClick(selectedValue.toString(), selection?.label)
              : props.onClick(selectedValue.toString());
          }
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  searchInput: {
    width: "100%",
  },
  boldFont: {
    fontWeight: 600,
  },
  inputHeight: {
    height: "30px",
  },
}));
