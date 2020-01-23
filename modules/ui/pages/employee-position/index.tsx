import * as React from "react";
import { useState, useMemo } from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { PositionEditUI } from "./ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import {
  PeopleEmployeePositionEditRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { GetEmployeePosition } from "./graphql/get-employee-position.gen";
import { SaveEmployeePosition } from "./graphql/save-employee-position.gen";
import { EmployeeInput } from "graphql/server-types.gen";
import { useHistory } from "react-router";

type Props = {};

export const EmployeePosition: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PeopleEmployeePositionEditRoute);
  const classes = useStyles();
  const history = useHistory();
  const [positionTypeName, setPositionTypeName] = useState<string | null>(null);

  const [saveEmployeePosition] = useMutationBundle(SaveEmployeePosition, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getEmployeePosition = useQueryBundle(GetEmployeePosition, {
    variables: {
      id: params.orgUserId,
    },
  });

  const orgUser =
    getEmployeePosition.state === "LOADING"
      ? undefined
      : getEmployeePosition?.data?.orgUser?.byId;

  if (getEmployeePosition.state === "LOADING" || !orgUser?.employee) {
    return <></>;
  }

  const position = orgUser.employee.primaryPosition;

  const handleSave = async (employee: EmployeeInput) => {
    await saveEmployeePosition({
      variables: {
        employee,
      },
    });
  };

  const handleCancel = () => {
    history.push(PersonViewRoute.generate(params));
  };

  const positionTypeLabel = positionTypeName
    ? `${t("Position")} - ${positionTypeName}`
    : t("Position");

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={`${orgUser?.firstName} ${orgUser?.lastName}`} />
        <Typography variant="h1">{positionTypeLabel}</Typography>
      </div>
      <PositionEditUI
        position={position}
        onSave={handleSave}
        onCancel={handleCancel}
        submitLabel={t("Save")}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
}));
