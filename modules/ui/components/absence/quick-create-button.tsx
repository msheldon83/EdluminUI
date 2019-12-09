import { IconButton, makeStyles } from "@material-ui/core";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import * as React from "react";
import { Link } from "react-router-dom";
import {
  AdminSelectEmployeeForCreateAbsenceRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";

type Props = { role: string };

export const QuickCreateButton: React.FC<Props> = props => {
  const iconButtonClasses = useIconButtonClasses();
  const params = useRouteParams(AdminChromeRoute);
  const adminInOrg = !isNaN(+params.organizationId);

  const showQuickCreate =
    props.role === "employee" || (props.role === "admin" && adminInOrg);

  return (
    <>
      {showQuickCreate && (
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
      )}
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
