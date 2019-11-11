import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import Maybe from "graphql/tsutils/Maybe";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { makeStyles, Grid } from "@material-ui/core";
import { Redirect, useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { useState } from "react";
import * as yup from "yup";
import { UpdateOrgUser } from "./graphql/update-orguser.gen";
import { UpdateEmployee } from "./graphql/update-employee.gen";
import { PageHeader } from "ui/components/page-header";
import { PageHeaderMultiField, FieldData } from "ui/components/page-header-multifieldedit";
import { DeleteOrgUser } from "./graphql/delete-orguser.gen";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const PersonViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useScreenSize() === "mobile";
  const history = useHistory();
  const params = useRouteParams(PersonViewRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);

  const [deleteOrgUserMutation] = useMutationBundle(DeleteOrgUser);
  const deleteOrgUser = React.useCallback(() => {
    history.push(PeopleRoute.generate(params));
    return deleteOrgUserMutation({
      variables: {
        orgUserId: Number(params.orgUserId),
      },
    });
  }, [deleteOrgUserMutation, history, params]);

  const [updateEmployee] = useMutationBundle(UpdateEmployee);
  const [updateOrgUser] = useMutationBundle(UpdateOrgUser);
  const activateDeactivateOrgUser = React.useCallback(
    (active: boolean) => {
      return updateOrgUser({
        variables: {
          orgUser: {
            id: Number(params.orgUserId),
            active: !active,
          },
        },
      });
    },
    [updateOrgUser, params]
  );

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  if (getOrgUser.state === "LOADING") {
    return <></>;
  }

  const orgUser = getOrgUser?.data?.orgUser?.byId;
  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const employee = orgUser.employee;

  if (active === null) {
    setActive(orgUser.active);
  }

  const updateName = async (nameFields: FieldData[]) => {
    const lastName = nameFields.find(x => x.key === "lastName")?.value;
    const middleName = nameFields.find(x => x.key === "middleName")?.value;
    const firstName = nameFields.find(x => x.key === "firstName")?.value;

    await updateOrgUser({
      variables: {
        orgUser: {
          id: Number(orgUser.id),
          lastName,
          firstName, 
          middleName
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updateEmployee({
      variables: {
        employee: {
          id: Number(employee ? employee.id : 0),
          rowVersion: employee ? employee.rowVersion : "",
          externalId,
        },
      },
    });
  };

  return (
    <>
      <PageTitle title={t("Person")} withoutHeading={!isMobile} />
      <PageHeaderMultiField
        text={`${orgUser.firstName} ${orgUser.lastName}`}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
        validationSchema={yup.object().shape({
          firstName: yup.string().required(t("First name is required")),
          middleName: yup.string(),
          lastName: yup.string().required(t("Last name is required")),
        })}
        fields={[
          {
            key: "firstName", 
            value: orgUser.firstName, 
            label: t("First Name")
          },
          {
            key: "middleName", 
            value: orgUser.middleName, 
            label: t("Middle Name")
          },
          {
            key: "lastName", 
            value: orgUser.lastName, 
            label: t("Last Name")
          }
        ]}
        onSubmit={async (value: Maybe<Array<FieldData>>) => {
          await updateName(value!);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: active ? t("Inactivate") : t("Activate"),
            onClick: async () => {
              await activateDeactivateOrgUser(
                !active,
              );
              setActive(!active);
            },
          },
          {
            name: t("Delete"),
            onClick: deleteOrgUser,
          },
        ]}
        isInactive={!active}
        inactiveDisplayText={t("This person is currently inactive.")}
        onActivate={async () => {
          await activateDeactivateOrgUser(true);
          setActive(true);
        }}
      />
      {employee && (
        <PageHeader
          text={employee.externalId}
          label={t("External ID")}
          editable={editing === null}
          onEdit={() => setEditing(editableSections.externalId)}
          validationSchema={yup.object().shape({
            value: yup.string().nullable(),
          })}
          onSubmit={async (value: Maybe<string>) => {
            await updateExternalId(value);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
          isSubHeader={true}
          showLabel={true}
        />)
      }
    </>
  );
};

const useStyles = makeStyles(theme => ({
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));
