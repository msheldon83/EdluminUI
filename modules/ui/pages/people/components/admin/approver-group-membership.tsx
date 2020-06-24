import * as React from "react";
import { useMemo, useState } from "react";
import { Grid, makeStyles, InputLabel } from "@material-ui/core";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import clsx from "clsx";
import { Formik } from "formik";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { Section } from "ui/components/section";
import {
  PermissionEnum,
  ApproverGroupRemoveMemberInput,
  ApproverGroupHeader,
  ApproverGroupCreateInput,
  ApproverGroupAddMemberInput,
} from "graphql/server-types.gen";
import { SectionHeader } from "ui/components/section-header";
import { TextButton } from "ui/components/text-button";
import { useLocations } from "reference-data/locations";
import { AddApproverGroupMember } from "../../graphql/admin/add-approver-group-member.gen";
import { AddApproverGroupLocation } from "../../graphql/admin/add-approver-group-location.gen";
import { RemoveApproverGroupMember } from "../../graphql/admin/remove-approver-group-member.gen";
import { useApproverGroups } from "reference-data/approver-groups";
import { GetApproverGroupsByUser } from "../../graphql/admin/get-approver-groups-by-user.gen";
import { useTranslation } from "react-i18next";

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

  const [selectedLocation, setSelectedLocation] = useState<string>();

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
  const approverGroupHeaderOptions: OptionType[] = useMemo(
    () =>
      approverGroupHeaders
        .filter(
          l =>
            !userApproverGroupHeaders?.find(
              e => e?.id === l.id && !e.variesByLocation
            )
        )
        .map(p => ({ label: p.name, value: p.id })),
    [approverGroupHeaders, userApproverGroupHeaders]
  );

  const selectedApproverGroupHeader = useMemo(
    () =>
      approverGroupHeaders.find(e => e.id === approverGroupHeaderIdSelected),
    [approverGroupHeaders, approverGroupHeaderIdSelected]
  );

  const locations = useLocations(props.orgId);
  const locationOptions: OptionType[] = useMemo(
    () =>
      locations
        .filter(
          l =>
            !selectedApproverGroupHeader?.approverGroups.find(
              c =>
                c?.location?.id === l.id &&
                c.approverGroupHeaderId === approverGroupHeaderIdSelected
            )?.location
        )
        .map(p => ({ label: p.name, value: p.id })),
    [locations, selectedApproverGroupHeader, approverGroupHeaderIdSelected]
  );

  if (!userApproverGroupHeaders) {
    return <></>;
  }

  const onAddApproverGroupMembership = async (
    member: ApproverGroupAddMemberInput
  ) => {
    const result = await addApproverGroupMember({
      variables: {
        member: member,
      },
    });
    await getUserApproverGroupHeaders.refetch();
    return result;
  };

  const onRemoveApproverGroupMembership = async (
    member: ApproverGroupRemoveMemberInput
  ) => {
    await removeApproverGroupMember({
      variables: {
        member: member,
      },
    });
    await getUserApproverGroupHeaders.refetch();
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

  const locationAction = async () => {
    let approverGroupIdToAdd = selectedApproverGroupHeader?.approverGroups.find(
      x => selectedLocation === x?.location?.id
    )?.id;

    if (approverGroupIdToAdd === undefined && selectedLocation) {
      approverGroupIdToAdd = await onAddApproverGroupLocation({
        approverGroupHeaderId:
          (selectedApproverGroupHeader && selectedApproverGroupHeader.id) ?? "",
        locationId: selectedLocation,
        orgId: props.orgId,
      });
    }

    return (
      approverGroupIdToAdd &&
      (await onAddApproverGroupMembership({
        approverGroupId: approverGroupIdToAdd,
        orgId: props.orgId,
        orgUserId: props.orgUserId,
      }))
    );
  };

  return (
    <Formik
      initialValues={{
        approverGroupHeaderId: undefined,
        locationIds: selectedLocation ?? "",
      }}
      onSubmit={async (data, e) => {
        props.onCancel();
      }}
    >
      {({ values, handleSubmit, setFieldValue, errors }) => (
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
                  props.onCancel();
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid container item spacing={2} xs={12}>
                {editingThis && (
                  <>
                    <Grid item xs={4}>
                      <InputLabel className={classes.fontBold}>
                        {t("Add approver groups")}
                      </InputLabel>
                      <SelectNew
                        onChange={e => {
                          const id = e.value.toString();
                          setFieldValue("approverGroupHeaderId", id);
                          setFieldValue("locationIds", "");
                          setSelectedLocation(undefined);
                          setApproverGroupHeaderIdSelected(id);
                        }}
                        options={approverGroupHeaderOptions}
                        value={
                          approverGroupHeaderOptions.find(
                            e =>
                              e.value &&
                              e.value === approverGroupHeaderIdSelected
                          ) ?? { label: "", value: "" }
                        }
                        multiple={false}
                      />
                    </Grid>
                    {selectedApproverGroupHeader?.variesByLocation && (
                      <Grid item xs={4}>
                        <InputLabel className={classes.fontBold}>
                          {t("for School")}
                        </InputLabel>
                        <SelectNew
                          onChange={e => {
                            const id = e.value.toString();
                            setSelectedLocation(id);
                            setFieldValue("locationIds", id);
                          }}
                          options={locationOptions}
                          value={
                            locationOptions.find(
                              e => e.value && e.value === selectedLocation
                            ) ?? { label: "", value: "" }
                          }
                          multiple={false}
                        />
                      </Grid>
                    )}
                    {selectedLocation && (
                      <TextButton
                        className={clsx(classes.addLink, classes.displayInline)}
                        onClick={async () => {
                          const result = await locationAction();
                          if (result) {
                            setFieldValue("locationIds", "");
                            setSelectedLocation(undefined);
                          }
                        }}
                      >
                        {t("Add")}
                      </TextButton>
                    )}
                    {selectedApproverGroupHeader &&
                      !selectedApproverGroupHeader?.variesByLocation && (
                        <TextButton
                          className={clsx(
                            classes.addLink,
                            classes.displayInline
                          )}
                          onClick={async () => {
                            const result = await onAddApproverGroupMembership({
                              approverGroupId:
                                (selectedApproverGroupHeader &&
                                  selectedApproverGroupHeader.approverGroups[0]!
                                    .id) ??
                                "",
                              orgUserId: props.orgUserId,
                              orgId: props.orgId,
                            });

                            if (result)
                              setFieldValue("approverGroupHeaderId", "");
                          }}
                        >
                          {t("Add")}
                        </TextButton>
                      )}
                  </>
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
                                        approverGroupId:
                                          n?.approverGroups[0].id,
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
