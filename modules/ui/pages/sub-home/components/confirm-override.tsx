import {
  Dialog,
  DialogActions,
  makeStyles,
  Grid,
  Box,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";

type Props = {
  open?: boolean;
  orgId: string;
  vacancyId: string;
  setOverrideDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onAccept: (
    orgId: string,
    vacancyId: string,
    unavailableToWork?: boolean,
    overridePreferred?: boolean
  ) => Promise<void>;
};

export const ConfirmOverrideDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Dialog
      open={props.open ?? false}
      onClose={() => props.setOverrideDialogOpen!(false)}
    >
      <Box height={300} width={510}>
        <div style={{ padding: 20 }}>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              {t(
                "Your schedule indicates that you are unavailable to work.  Would you like to accept anyway?"
              )}
            </Grid>
          </Grid>
        </div>
      </Box>
      <DialogActions>
        <TextButton onClick={() => props.setOverrideDialogOpen!(false)}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={() =>
            props.onAccept(props.orgId, props.vacancyId, true, true)
          }
        >
          {t("Accept")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  dialog: {
    maxWidth: 400,
    maxHeight: 230,
  },
  typography: {
    padding: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  subTitle: {
    fontSize: theme.typography.fontSize,
  },
  checkIcon: {
    color: "#099E47",
    fontSize: "3em",
  },
  progress: {
    width: 300,
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));
