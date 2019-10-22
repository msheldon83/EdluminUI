import * as React from "react";
import {
  Grid,
  Typography,
  makeStyles,
  Button,
  Toolbar,
  AppBar,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";

type Props = {
  currentOrganizationName: string;
  onSwitch: () => void;
  contentClassName?: string;
};

export const OrganizationSwitcherUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const toolbarClasses = useToolbarClasses();
  console.log("orgswitcherui", props);

  return (
    <AppBar position="fixed" className={classes.bottomBar}>
      <Toolbar classes={toolbarClasses}>
        <div className={props.contentClassName}>
          <Grid container alignItems="center">
            <Typography className={classes.text}>
              {t("You are working in")}&nbsp;
            </Typography>
            <Typography className={classes.orgName}>
              {props.currentOrganizationName}
            </Typography>
            <Button
              onClick={props.onSwitch}
              className={classes.button}
              endIcon={<SwapHorizIcon />}
            >
              {t("Switch")}
            </Button>
          </Grid>
        </div>
      </Toolbar>
    </AppBar>
  );
};
const useStyles = makeStyles(theme => ({
  bottomBar: {
    bottom: 0,
    top: "auto",
    background: theme.customColors.lightBlue,
  },
  text: {
    color: theme.customColors.gray,
    fontWeight: 500,
  },
  orgName: {
    color: theme.customColors.darkBlueGray,
    fontWeight: 500,
  },
  button: {
    marginLeft: theme.spacing(4),
    color: theme.customColors.gray,
    paddingTop: 0,
    paddingBottom: 0,
    "&:hover": {
      backgroundColor: "inherit",
    },
  },
}));

const useToolbarClasses = makeStyles(theme => ({
  root: {
    minHeight: theme.typography.pxToRem(34),
  },
}));
