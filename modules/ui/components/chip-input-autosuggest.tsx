// Brought over from https://github.com/TeamWertarbyte/material-ui-chip-input/blob/1380b3e024f2954e796bd63bcd5429fd8cf5c3ba/stories/examples/react-autosuggest.js
// Reafactored to include types and be a functional component

import * as React from "react";
import * as Autosuggest from "react-autosuggest";
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import ChipInput from "material-ui-chip-input";
import {
  RenderSuggestionsContainerParams,
  SuggestionsFetchRequestedParams,
} from "react-autosuggest";

const renderInput = (inputProps: any) => {
  const { value, onChange, chips, ref, ...other } = inputProps;

  return (
    <ChipInput
      clearInputValueOnChange
      onUpdateInput={onChange}
      value={chips}
      inputRef={ref}
      {...other}
    />
  );
};

const renderSuggestion = (
  suggestion: Data,
  { query, isHighlighted }: { query: string; isHighlighted: boolean }
) => {
  const matches: number[] | number[][] = AutosuggestHighlightMatch(
    suggestion.text,
    query
  );
  const parts: Array<{
    text: string;
    highlight: boolean;
  }> = AutosuggestHighlightParse(suggestion.text, matches);

  return (
    <MenuItem
      selected={isHighlighted}
      component="div"
      onMouseDown={(e: React.MouseEvent<HTMLElement>) => e.preventDefault()} // prevent the click causing the input to be blurred
    >
      <div>
        {parts.map((part, index: number) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <span key={String(index)}>{part.text}</span>
          );
        })}
      </div>
    </MenuItem>
  );
};

const renderSuggestionsContainer = (
  options: RenderSuggestionsContainerParams
) => {
  const { containerProps, children } = options;

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  );
};

const getSuggestionValue = (suggestion: Data) => {
  return suggestion.text;
};

const getSuggestions = (
  value: string,
  dataSource: Array<Data>,
  selections: Array<Data>
) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  if (inputLength === 0) {
    return [];
  }

  // Filter current selections out of the possible suggestions
  const possibleSuggestions = dataSource.filter(
    d => !selections.find(s => s.value === d.value)
  );

  const result = possibleSuggestions.filter((s: Data) => {
    const keep = count < 5 && s.text.toLowerCase().includes(inputValue);

    if (keep) {
      count += 1;
    }

    return keep;
  });

  return result;
};

type Props = {
  label?: string;
  dataSource: Array<Data>;
  defaultSelections?: Array<Data>;
  onChange: (selections: Array<Data>) => void;
  fullWidth?: boolean;
};

type Data = {
  text: string;
  value: string;
};

export const ChipInputAutoSuggest: React.FC<Props> = props => {
  const classes = useStyles();
  const [suggestions, setSuggestions] = React.useState<Data[]>([]);
  const defaultValue = props.defaultSelections
    ? props.defaultSelections.map(s => s.text)
    : [];
  const [value, setValue] = React.useState<any[]>(defaultValue);
  const [selections, setSelections] = React.useState<Data[]>(
    props.defaultSelections ? props.defaultSelections : []
  );
  const [textFieldInput, setTextFieldInput] = React.useState("");

  const handleSuggestionsFetchRequested = ({
    value,
  }: SuggestionsFetchRequestedParams) => {
    setSuggestions(getSuggestions(value, props.dataSource, selections));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handletextFieldInputChange = (event: any, { newValue }: any) => {
    setTextFieldInput(newValue);
  };

  const handleAddChip = (chip: any) => {
    const matchingDataItem = props.dataSource.find(d => d.text === chip);
    if (!matchingDataItem) {
      setTextFieldInput("");
      return;
    }

    if (!value.includes(chip)) {
      // Set the value for the Chip Input
      setValue([...value, chip]);

      // Set the list of selections locally and call props.onChange with the new list
      const updatedSelections = [...selections, matchingDataItem];
      setSelections(updatedSelections);
      props.onChange(updatedSelections);

      // Clear out auto complete pieces
      setTextFieldInput("");
      setSuggestions([]);
    }
  };

  const handleDeleteChip = (chip: any, index: number) => {
    const selectionToRemove = props.dataSource.find(d => d.text === chip);

    // Remove from the Chip values
    const temp = value.slice();
    temp.splice(index, 1);
    setValue(temp);

    // Remove from our list of selections
    if (selectionToRemove) {
      const updatedSelections = selections.filter(
        s => s.value != selectionToRemove.value
      );
      setSelections(updatedSelections);
      props.onChange(updatedSelections);
    }
  };

  return (
    <Autosuggest
      theme={{
        container: classes.container,
        suggestionsContainerOpen: classes.suggestionsContainerOpen,
        suggestionsList: classes.suggestionsList,
        suggestion: classes.suggestion,
      }}
      renderInputComponent={inputProps => {
        return renderInput({
          chips: value,
          onAdd: (chip: any) => handleAddChip(chip),
          onDelete: (chip: any, index: number) => handleDeleteChip(chip, index),
          label: props.label,
          fullWidth: props.fullWidth,
          ...inputProps,
        });
      }}
      suggestions={suggestions}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionsClearRequested={handleSuggestionsClearRequested}
      renderSuggestionsContainer={renderSuggestionsContainer}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={(e, { suggestionValue }) => {
        handleAddChip(suggestionValue);
        e.preventDefault();
      }}
      focusInputOnSuggestionClick={true}
      inputProps={{
        value: textFieldInput,
        onChange: handletextFieldInputChange,
      }}
    />
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    flexGrow: 1,
    position: "relative",
  },
  suggestionsContainerOpen: {
    position: "absolute",
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(3),
    left: 0,
    right: 0,
    zIndex: 1,
  },
  suggestion: {
    display: "block",
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  textField: {
    width: "100%",
  },
}));
