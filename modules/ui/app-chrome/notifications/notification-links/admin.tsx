/* eslint-disable no-case-declarations */
import * as React from "react";
import { ObjectType } from "graphql/server-types.gen";
import { Link } from "react-router-dom";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";

type Props = {
  objectTypeId: ObjectType;
  objectKey: string;
  orgId: string;
};

export const AdminNotificationLink: React.FC<Props> = props => {
  switch (props.objectTypeId) {
    case ObjectType.Absence:
      const absenceEdit = AdminEditAbsenceRoute.generate({
        organizationId: props.orgId,
        absenceId: props.objectKey,
      });
      return (
        <>
          <Link to={absenceEdit} />
        </>
      );
    case ObjectType.Vacancy:
      const vacancyEdit = AdminEditAbsenceRoute.generate({
        organizationId: props.orgId,
        absenceId: props.objectKey,
      });
      return <Link to={vacancyEdit} />;
  }
  return <></>;
};
