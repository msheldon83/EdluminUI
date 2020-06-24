import * as React from "react";
import { useState } from "react";
import { useMutationBundle } from "graphql/hooks";
import { UpdateApproverGroupHeader } from "../graphql/update-approvergroup-header.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { PageHeader } from "ui/components/page-header";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { PermissionEnum } from "graphql/server-types.gen";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

type Props = {
  approverGroupHeaderId: string;
  name: string;
  identifier?: string | null;
  rowVersion: string;
};

export const NameHeader: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [editing, setEditing] = useState<string | null>(null);

  const [updateApproverGroupHeader] = useMutationBundle(
    UpdateApproverGroupHeader,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const onUpdateIdentifier = async (identifier?: string | null) => {
    const result = await updateApproverGroupHeader({
      variables: {
        approverGroupHeader: {
          id: props.approverGroupHeaderId,
          rowVersion: props.rowVersion,
          externalId: identifier,
        },
      },
    });
    if (result.data) {
      setEditing(null);
    }
  };

  const onUpdateName = async (name?: string | null) => {
    const result = await updateApproverGroupHeader({
      variables: {
        approverGroupHeader: {
          id: props.approverGroupHeaderId,
          rowVersion: props.rowVersion,
          name: name,
        },
      },
    });
    if (result.data) {
      setEditing(null);
    }
  };

  return (
    <>
      <PageHeader
        text={props.name}
        label={t("Name")}
        editable={!editing}
        onEdit={() => setEditing(editableSections.name)}
        editPermissions={[PermissionEnum.ApprovalSettingsSave]}
        validationSchema={yup.object().shape({
          value: yup
            .string()
            .nullable()
            .required(t("Name is required")),
        })}
        onSubmit={onUpdateName}
        onCancel={() => setEditing(null)}
        isSubHeader={false}
        showLabel={true}
      />
      <PageHeader
        text={props.identifier}
        label={t("Identifier")}
        editable={!editing}
        onEdit={() => setEditing(editableSections.externalId)}
        editPermissions={[PermissionEnum.ApprovalSettingsSave]}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={onUpdateIdentifier}
        onCancel={() => setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />
    </>
  );
};
