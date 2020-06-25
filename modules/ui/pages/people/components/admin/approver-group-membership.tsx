import * as React from "react";
import { useMemo, useState } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { Formik } from "formik";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { Section } from "ui/components/section";
import {
  PermissionEnum,
  ApproverGroupRemoveMemberInput,
  ApproverGroupCreateInput,
  ApproverGroupAddMemberInput,
} from "graphql/server-types.gen";
import { SectionHeader } from "ui/components/section-header";
import { TextButton } from "ui/components/text-button";
import { AddApproverGroupMember } from "../../graphql/admin/add-approver-group-member.gen";
import { AddApproverGroupLocation } from "../../graphql/admin/add-approver-group-location.gen";
import { RemoveApproverGroupMember } from "../../graphql/admin/remove-approver-group-member.gen";
import { useApproverGroups } from "reference-data/approver-groups";
import { GetApproverGroupsByUser } from "../../graphql/admin/get-approver-groups-by-user.gen";
import { useTranslation } from "react-i18next";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { ApproverGroupSelect } from "ui/components/domain-selects/approver-group-select/approver-group-select";
import { compact } from "lodash-es";

const editableSections = {
  approverGroupMembership: "edit-approver-group-membership",
};

type Props = {
  editing: string | null;
  editable: boolean;
  orgId: string;
  orgUserId: string;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  onCancel: () => void;
};

export const ApproverGroupMembership: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const editingThis =
    props.editing === editableSections.approverGroupMembership;

  const [
    approverGroupHeaderIdSelected,
    setApproverGroupHeaderIdSelected,
  ] = useState<string>();

  const [addApproverGroupMember] = useMutationBundle(AddApproverGroupMember, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [addApproverGroupLocation] = useMutationBundle(
    AddApproverGroupLocation,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const [removeApproverGroupMember] = useMutationBundle(
    RemoveApproverGroupMember,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const getUserApproverGroupHeaders = useQueryBundle(GetApproverGroupsByUser, {
    variables: { orgUserId: props.orgUserId, orgId: props.orgId },
  });

  const userApproverGroupHeaders =
    getUserApproverGroupHeaders.state === "LOADING"
      ? undefined
      : getUserApproverGroupHeaders.data.approverGroup
          ?.approverGroupHeadersByOrgUserId;

  const approverGroupHeaders = useApproverGroups(props.orgId);
  const approverGroupHeaderIdsToRemoveFromSelect =
    compact(
      userApproverGroupHeaders?.map(x => {
        if (!x?.variesByLocation) return x?.id;
      })
    ) ?? [];

  const selectedApproverGroupHeader = useMemo(() => {
    if (approverGroupHeaderIdSelected) {
      return approverGroupHeaders.find(
        e => e.id === approverGroupHeaderIdSelected
      );
    }
    return undefined;
  }, [approverGroupHeaders, approverGroupHeaderIdSelected]);

  const locationIdsToRemoveFromSelect =
    compact(
      userApproverGroupHeaders
        ?.find(x => x?.id === approverGroupHeaderIdSelected)
        ?.approverGroups.map(p => p?.locationId)
    ) ?? [];

  const onAddApproverGroupMembership = async (
    member: ApproverGroupAddMemberInput
  ) => {
    const result = await addApproverGroupMember({
      variables: {
        member: member,
      },
    });
    if (result.data) {
      await getUserApproverGroupHeaders.refetch();
      return true;
    }
    return false;
  };

  const onRemoveApproverGroupMembership = async (
    member: ApproverGroupRemoveMemberInput
  ) => {
    const result = await removeApproverGroupMember({
      variables: {
        member: member,
      },
    });
    if (result.data) {
      await getUserApproverGroupHeaders.refetch();
    }
  };

  const onAddApproverGroupLocation = async (
    approverGroup: ApproverGroupCreateInput
  ) => {
    const result = await addApproverGroupLocation({
      variables: {
        approverGroup: approverGroup,
      },
    });

    return result.data?.approverGroup?.createApproverGroupForLocation
      ?.id as string;
  };

  const doAdd = async (approverGroupHeaderId: string, locationId?: string) => {
    const approverGroupHeader = approverGroupHeaders.find(
      x => x.id === approverGroupHeaderId
    );
    if (!approverGroupHeader) return false;

    if (!approverGroupHeader.variesByLocation) {
      const result = await onAddApproverGroupMembership({
        orgId: props.orgId,
        orgUserId: props.orgUserId,
        approverGroupId: approverGroupHeader.approverGroups[0]!.id,
      });
      return result;
    }

    let approverGroupIdToAdd = approverGroupHeader.approverGroups.find(
      x => x?.locationId === locationId
    )?.id;
    if (approverGroupIdToAdd === undefined && locationId) {
      approverGroupIdToAdd = await onAddApproverGroupLocation({
        approverGroupHeaderId: approverGroupHeaderId,
        locationId: locationId,
        orgId: props.orgId,
      });
    }

    if (approverGroupIdToAdd) {
      const result = await onAddApproverGroupMembership({
        approverGroupId: approverGroupIdToAdd,
        orgId: props.orgId,
        orgUserId: props.orgUserId,
      });
      return result;
    }
    return false;
  };

  return (
    <Formik
      initialValues={{
        approverGroupHeaderId: undefined,
        locationId: undefined,
      }}
      onSubmit={async (data, formProps) => {
        if (data.approverGroupHeaderId) {
          const result = await doAdd(
            data.approverGroupHeaderId ?? "",
            data.locationId
          );
          if (result) {
            if (data.locationId) {
              formProps.setFieldValue("locationId", undefined);
            } else {
              setApproverGroupHeaderIdSelected(undefined);
              formProps.setFieldValue("approverGroupHeaderId", undefined);
            }
          }
        }
      }}
      onReset={(values, formProps) => {
        setApproverGroupHeaderIdSelected(undefined);
        formProps.setFieldValue("approverGroupHeaderId", undefined);
        formProps.setFieldValue("locationId", undefined);
        props.onCancel();
      }}
    >
      {({
        values,
        handleSubmit,
        submitForm,
        setFieldValue,
        errors,
        handleReset,
      }) => (
        <form onSubmit={handleSubmit}>
          <Section>
            <SectionHeader
              title={t("Approver group membership")}
              actions={[
                {
                  text: t("Edit"),
                  visible: !props.editing && props.editable,
                  execute: () => {
                    props.setEditing!(editableSections.approverGroupMembership);
                  },
                  permissions: [PermissionEnum.ApprovalSettingsSave],
                },
              ]}
              cancel={{
                text: t("Done"),
                visible: editingThis,
                execute: () => {
                  handleReset();
                },
              }}
            />
            <Grid container spacing={2}>
              {editingThis && (
                <Grid container item spacing={2} xs={12}>
                  <Grid item xs={4}>
                    <ApproverGroupSelect
                      orgId={props.orgId}
                      selectedApproverGroupHeaderIds={
                        values.approverGroupHeaderId && [
                          values.approverGroupHeaderId,
                        ]
                      }
                      multiple={false}
                      label={t("Add approver groups")}
                      setSelectedApproverGroupHeaderIds={(ids?: string[]) => {
                        if (ids) {
                          setApproverGroupHeaderIdSelected(ids[0]);
                          setFieldValue("approverGroupHeaderId", ids[0]);
                        } else {
                          setApproverGroupHeaderIdSelected(undefined);
                          setFieldValue("approverGroupHeaderId", undefined);
                        }
                      }}
                      idsToFilterOut={approverGroupHeaderIdsToRemoveFromSelect}
                    />
                  </Grid>
                  {selectedApproverGroupHeader?.variesByLocation && (
                    <Grid item xs={4}>
                      <LocationSelect
                        orgId={props.orgId}
                        selectedLocationIds={
                          values.locationId && [values.locationId]
                        }
                        multiple={false}
                        label={t("for School")}
                        includeAllOption={false}
                        setSelectedLocationIds={(ids?: string[]) => {
                          if (ids) {
                            setFieldValue("locationId", ids[0]);
                          } else {
                            setFieldValue("locationId", undefined);
                          }
                        }}
                        idsToRemoveFromOptions={locationIdsToRemoveFromSelect}
                      />
                    </Grid>
                  )}
                  {values.approverGroupHeaderId &&
                    (!selectedApproverGroupHeader?.variesByLocation ||
                      values.locationId) && (
                      <TextButton
                        className={clsx(classes.addLink, classes.displayInline)}
                        onClick={submitForm}
                      >
                        {t("Add")}
                      </TextButton>
                    )}
                </Grid>
              )}
              <Grid container item spacing={2} xs={12}>
                {userApproverGroupHeaders?.length === 0 ? (
                  <Grid item xs={12}>
                    {t("User is not in any approver groups")}
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    {userApproverGroupHeaders &&
                      userApproverGroupHeaders?.map((n: any, i: number) =>
                        n?.variesByLocation ? (
                          <div key={i} className={classes.displayInline}>
                            {t(`${n?.name}`)}
                            {n?.approverGroups &&
                              n?.approverGroups.map((x: any, j: number) => (
                                <div
                                  key={j + 1000}
                                  className={clsx(
                                    classes.indent,
                                    classes.displayInline
                                  )}
                                >
                                  {x.location.name}
                                  {editingThis && (
                                    <TextButton
                                      className={clsx(
                                        classes.removeLink,
                                        classes.displayInline
                                      )}
                                      onClick={async () => {
                                        const result = await onRemoveApproverGroupMembership(
                                          {
                                            approverGroupId: x.id,
                                            orgUserId: props.orgUserId,
                                          }
                                        );
                                      }}
                                    >
                                      {t("Remove")}
                                    </TextButton>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div key={i} className={classes.displayInline}>
                            {t(`${n?.name}`)}{" "}
                            {n?.approvalWorkflows &&
                              t(
                                `(${n?.approvalWorkflows.length} workflows)`
                              )}{" "}
                            {editingThis && (
                              <TextButton
                                className={clsx(
                                  classes.removeLink,
                                  classes.displayInline
                                )}
                                onClick={async () => {
                                  const result = await onRemoveApproverGroupMembership(
                                    {
                                      approverGroupId: n?.approverGroups[0].id,
                                      orgUserId: props.orgUserId,
                                    }
                                  );
                                }}
                              >
                                {t("Remove")}
                              </TextButton>
                            )}
                          </div>
                        )
                      )}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Section>
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  fontBold: {
    fontWeight: "bold",
  },
  displayInline: {
    display: "line-block",
  },
  removeLink: {
    color: theme.customColors.darkRed,
  },
  addLink: {
    marginTop: "15px",
    color: theme.customColors.blue,
  },
  indent: {
    marginLeft: theme.spacing(2),
  },
}));
