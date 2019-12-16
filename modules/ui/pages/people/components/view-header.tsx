import * as React from "react";
import { PageHeader } from "ui/components/page-header";
import {
  PageHeaderMultiField,
  FieldData,
} from "ui/components/page-header-multifieldedit";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import Maybe from "graphql/tsutils/Maybe";
import { OrgUserUpdateInput } from "graphql/server-types.gen";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

type Props = {
  editing: string | null;
  orgUser: {
    id: string;
    active: boolean;
    firstName: string;
    middleName?: string | null | undefined;
    lastName: string;
    rowVersion: string;
    externalId?: string | null | undefined;
  };
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  deleteOrgUser: () => Promise<unknown>;
  onSaveOrgUser: (orgUser: OrgUserUpdateInput) => Promise<unknown>;
};

export const PersonViewHeader: React.FC<Props> = props => {
  const orgUser = props.orgUser;
  const { t } = useTranslation();

  return (
    <>
      <PageHeaderMultiField
        text={`${orgUser.firstName} ${
          orgUser.middleName ? `${orgUser.middleName} ` : ""
        }${orgUser.lastName}`}
        label={t("Name")}
        editable={props.editing === null}
        onEdit={() => props.setEditing(editableSections.name)}
        validationSchema={yup.object().shape({
          firstName: yup.string().required(t("First name is required")),
          middleName: yup.string().nullable(),
          lastName: yup.string().required(t("Last name is required")),
        })}
        fields={[
          {
            key: "firstName",
            value: orgUser.firstName,
            label: t("First Name"),
          },
          {
            key: "middleName",
            value: orgUser.middleName,
            label: t("Middle Name"),
          },
          {
            key: "lastName",
            value: orgUser.lastName,
            label: t("Last Name"),
          },
        ]}
        onSubmit={async (values: Array<FieldData>) => {
          await props.onSaveOrgUser({
            rowVersion: orgUser.rowVersion,
            id: Number(orgUser.id),
            firstName: values.find(x => x.key === "firstName")?.value,
            lastName: values.find(x => x.key === "lastName")?.value,
            middleName: values.find(x => x.key === "middleName")?.value,
          });
        }}
        onCancel={() => props.setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: orgUser.active ? t("Inactivate") : t("Activate"),
            onClick: async () => {
              await props.onSaveOrgUser({
                rowVersion: orgUser.rowVersion,
                id: Number(orgUser.id),
                active: !orgUser.active,
              });
            },
          },
          {
            name: t("Delete"),
            onClick: props.deleteOrgUser,
          },
        ]}
        isInactive={!orgUser.active}
        inactiveDisplayText={t("This person is currently inactive.")}
        onActivate={async () => {
          await props.onSaveOrgUser({
            rowVersion: orgUser.rowVersion,
            id: Number(orgUser.id),
            active: !orgUser.active,
          });
        }}
      />
      <PageHeader
        text={orgUser.externalId}
        label={t("External ID")}
        editable={props.editing === null}
        onEdit={() => props.setEditing(editableSections.externalId)}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await props.onSaveOrgUser({
            rowVersion: orgUser.rowVersion,
            id: Number(orgUser.id),
            externalId: value,
          });
        }}
        onCancel={() => props.setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />
    </>
  );
};
