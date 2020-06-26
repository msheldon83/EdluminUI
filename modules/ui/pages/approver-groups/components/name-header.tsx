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
import { DeleteApproverGroupHeader } from "../graphql/delete-approver-group-header.gen";
import { useHistory } from "react-router";
import { ApproverGroupsRoute } from "ui/routes/approver-groups";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

type Props = {
  orgId: string;
  approverGroupHeaderId: string;
  name: string;
  identifier?: string | null;
  rowVersion: string;
  inUse: boolean;
};

export const NameHeader: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const history = useHistory();

  const [editing, setEditing] = useState<string | null>(null);

  const [updateApproverGroupHeader] = useMutationBundle(
    UpdateApproverGroupHeader,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const [deleteApproverGroupHeader] = useMutationBundle(
    DeleteApproverGroupHeader,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const onDelete = async () => {
    if (props.inUse) {
      openSnackbar({
        message: <div>{t("This Group is used by a workflow")}</div>,
        dismissable: true,
        status: "error",
      });
    } else {
      const result = await deleteApproverGroupHeader({
        variables: { approverGroupHeaderId: props.approverGroupHeaderId },
      });
      if (result) {
        history.push(
          ApproverGroupsRoute.generate({ organizationId: props.orgId })
        );
      }
    }
  };

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
        actions={[
          {
            name: t("Delete"),
            onClick: onDelete,
            permissions: [PermissionEnum.ApprovalSettingsSave],
          },
        ]}
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
