import * as React from "react";
import { Grid, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TextButton } from "ui/components/text-button";
import clsx from "clsx";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import { makeStyles } from "@material-ui/styles";

type Props = {
  setNewCommentVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onAddComment: (payload: string) => void;
};

export const NewComment: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [payload, setPayload] = useState<string>("");

  const { setNewCommentVisible, onAddComment } = props;

  return (
    <Grid container item xs={12}>
      <Grid item xs={2} className={classes.width} />
      <Grid item xs={9}>
        <TextField
          rows="2"
          value={payload}
          multiline={true}
          placeholder={t("Comments")}
          fullWidth={true}
          variant="outlined"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPayload(e.target.value);
          }}
        />
      </Grid>
      <Grid item xs={1}>
        <div
          className={classes.iconContainer}
          onClick={() => {
            onAddComment(payload);
          }}
        >
          <CheckIcon />
        </div>
        <div
          className={classes.iconContainer}
          onClick={() => {
            setNewCommentVisible(false);
          }}
        >
          <ClearIcon className={classes.editIcon} />
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  iconContainer: {
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    "&:hover": {
      cursor: "pointer",
    },
  },
  width: {
    width: "100%",
  },
  displayInline: {
    display: "inline-block",
  },
  editIcon: {
    float: "left",
    marginTop: theme.spacing(1),
    height: "20px",
  },
  textHeight: {
    height: "30px",
  },
}));
