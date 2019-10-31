import * as React from "react";
import { PaginationInfo } from "graphql/hooks";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@material-ui/core";
import { uniq, sortBy } from "lodash-es";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";

type Props = {
  pagination: PaginationInfo;
};

export const PaginationControls: React.FC<Props> = props => {
  const {
    currentPage,
    totalPages,
    totalCount,
    resultsPerPage,
    setResultsPerPage,
    nextPage,
    previousPage,
  } = props.pagination;
  const classes = useStyles();
  const { t } = useTranslation();
  const options = sortBy(uniq([10, 25, 50, 100, resultsPerPage]));

  const startIndex = (currentPage - 1) * resultsPerPage + 1;
  const endIndex = Math.min(totalCount, startIndex + resultsPerPage - 1);

  return (
    <div className={classes.container}>
      <Typography className={classes.label}>{t("Rows per page")}</Typography>
      <Select
        value={resultsPerPage}
        onChange={evt => setResultsPerPage(Number(evt.target.value))}
      >
        {options.map(n => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        ))}
      </Select>
      <Typography className={classes.label}>
        {startIndex}-{endIndex} {t("of")} {totalCount}
      </Typography>
      <IconButton
        size="small"
        onClick={previousPage}
        disabled={currentPage <= 1}
      >
        <NavigateBeforeIcon />
      </IconButton>
      <IconButton
        size="small"
        onClick={nextPage}
        disabled={currentPage >= totalPages}
      >
        <NavigateNextIcon />
      </IconButton>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  label: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}));
