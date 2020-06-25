import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { makeStyles, Button, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { GetCountOfAbsVacNeedingApproval } from "./graphql/get-count-of-approval-items.gen";
import { ApprovalInboxRoute } from "ui/routes/approval-inbox";

type Props = {
  orgId: string;
};

export const ApprovalCountBanner: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const orgId = props.orgId;

  const getCount = useQueryBundle(GetCountOfAbsVacNeedingApproval, {
    variables: {
      orgId: orgId,
    },
  });

  const count =
    getCount.state === "DONE"
      ? getCount.data.vacancy?.countOfAbsVacNeedingApproval ?? 0
      : 0;

  return count > 0 ? (
    <div className={classes.container}>
      <Grid container spacing={1} alignItems="center" justify="space-between">
        <Grid item>
          <div className={classes.text}>{`${t("You have")} ${count} ${t(
            "items waiting for your approval."
          )}`}</div>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            component={Link}
            to={ApprovalInboxRoute.generate({ organizationId: orgId })}
          >
            {t("Review")}
          </Button>
        </Grid>
      </Grid>
    </div>
  ) : (
    <></>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    width: "100%",
    border: "1px solid #FFCC01",
    background: "#FFF5CC",
    borderRadius: "4px",
    boxSizing: "border-box",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  text: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(16),
  },
}));
