import { IconButton, makeStyles } from "@material-ui/core";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import * as React from "react";
import { Link } from "react-router-dom";
import {
  AdminSelectEmployeeForCreateAbsenceRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/absence";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = { role: string };

export const QuickCreateButton: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const params = useRouteParams(AdminChromeRoute);

  return (
    <>
      <Can do={[PermissionEnum.AbsVacSave]} orgId={params.organizationId}>
        <IconButton
          edge="end"
          classes={iconButtonClasses}
          component={Link}
          to={
            props.role === "admin"
              ? AdminSelectEmployeeForCreateAbsenceRoute.generate(params)
              : EmployeeCreateAbsenceRoute.generate({ role: props.role })
          }
        >
          <AddToPhotosIcon />
        </IconButton>
      </Can>
    </>
  );
};

const useIconButtonClasses = makeStyles(theme => ({
  label: {
    color: theme.customColors.black,
  },
  root: {
    marginLeft: theme.spacing(1),
  },
}));
