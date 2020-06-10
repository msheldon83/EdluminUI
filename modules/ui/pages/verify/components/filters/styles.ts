import { makeStyles } from "@material-ui/styles";

export const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    "@media print": {
      display: "none",
    },
  },
}));
