import * as React from "react";
import {
  PeopleRoute,
  AdminAddRoute,
  EmployeeAddRoute,
  SubstituteAddRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { MenuButton } from "ui/components/menu-button";

export const CreateButton: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const history = useHistory();

  return (
    <div>
      <MenuButton
        selectedIndex={1}
        options={[
          {
            name: t("Create an Admin"),
            onClick: () => history.push(AdminAddRoute.generate(params)),
          },
          {
            name: t("Create an Employee"),
            onClick: () => history.push(EmployeeAddRoute.generate(params)),
          },
          {
            name: t("Create a Substitute"),
            onClick: () => history.push(SubstituteAddRoute.generate(params)),
          },
        ]}
      />
    </div>
  );
};
