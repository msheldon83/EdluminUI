import * as React from "react";
import { useMemo, useState } from "react";
import { Grid, makeStyles, InputLabel } from "@material-ui/core";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import clsx from "clsx";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import {
  PermissionEnum,
  ApproverGroupHeader,
  ApproverGroup,
} from "graphql/server-types.gen";
import { SectionHeader } from "ui/components/section-header";
import { TextButton } from "ui/components/text-button";
import { useLocations } from "reference-data/locations";
import { useApproverGroups } from "reference-data/approver-groups";
import { useTranslation } from "react-i18next";

const editableSections = {
  approverGroupMembership: "edit-approver-group-membership",
};

type Props = {
  editing: string | null;
  editable: boolean;
  orgId: string;
  userApproverGroupHeaders: any[];
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmit: (
    add: any[] | undefined,
    remove: any[] | undefined
  ) => Promise<unknown>;
  onCancel: () => void;
};

export const ApproverGroupMembership: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [locationsSelected, setLocationsSelected] = useState<string[]>([]);

  const [
    approverGroupHeaderIdSelected,
    setApproverGroupHeaderIdSelected,
  ] = useState<string>();

  const groupsToRemove: string[] = [];

  const editingThis =
    props.editing === editableSections.approverGroupMembership;

  const userApprovedGroupHeaders = props.userApproverGroupHeaders;

  const approverGroupHeaders = useApproverGroups(props.orgId);
  const approverGroupHeaderOptions: OptionType[] = useMemo(
    () =>
      approverGroupHeaders
        .filter(
          l => !userApprovedGroupHeaders.includes((e: any) => e.id === l.id)
        )
        .map(p => ({ label: p.name, value: p.id })),
    [approverGroupHeaders, userApprovedGroupHeaders]
  );

  const locations = useLocations(props.orgId);
  const locationOptions: OptionType[] = useMemo(
    () =>
      locations
        .filter(l => !locationsSelected.includes(l.locationGroupId))
        .map(p => ({ label: p.name, value: p.id })),
    [locations, locationsSelected]
  );

  const selectedApproverGroup = useMemo(
    () =>
      approverGroupHeaders.find(e => e.id === approverGroupHeaderIdSelected),
    [approverGroupHeaders, approverGroupHeaderIdSelected]
  );

  console.log(userApprovedGroupHeaders);

  return (
    <>
      <Formik
        initialValues={{
          approverGroupHeaderId: undefined,
          locationIds: locationsSelected ?? [],
        }}
        onSubmit={async (data, e) => {
          const locationsToAdd = locationsSelected
            .map(
              e =>
                selectedApproverGroup?.approverGroups.find(x => {
                  e === x?.location?.id;
                })?.id
            )
            .filter(a => a !== undefined);

          const groupIdsToAdd = selectedApproverGroup?.variesByLocation
            ? locationsToAdd
            : selectedApproverGroup
            ? [selectedApproverGroup.approverGroups[0]!.id]
            : [];

          await props.onSubmit(groupIdsToAdd, groupsToRemove);
        }}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader
                title={t("Approver group membership")}
                actions={[
                  {
                    text: t("Edit"),
                    visible: !props.editing && props.editable,
                    execute: () => {
                      props.setEditing!(
                        editableSections.approverGroupMembership
                      );
                    },
                    permissions: [PermissionEnum.AdminSave],
                  },
                ]}
                cancel={{
                  text: t("Cancel"),
                  visible: editingThis,
                  execute: () => {
                    props.onCancel();
                  },
                }}
                submit={{
                  text: t("Save"),
                  visible: editingThis,
                  execute: submitForm,
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
                      {selectedApproverGroup?.variesByLocation && (
                        <Grid item xs={4}>
                          <InputLabel className={classes.fontBold}>
                            {t("for School")}
                          </InputLabel>
                          <SelectNew
                            onChange={e => {
                              const ids = e.map((v: OptionType) =>
                                v.value.toString()
                              );
                              setFieldValue("locationIds", ids);
                              setLocationsSelected(ids);
                            }}
                            options={locationOptions}
                            value={
                              locationOptions.filter(
                                e =>
                                  e.value &&
                                  values?.locationIds?.includes(
                                    e.value.toString()
                                  )
                              ) ?? { label: "", value: "" }
                            }
                            multiple={true}
                          />
                        </Grid>
                      )}
                    </>
                  )}
                  <Grid container item spacing={2} xs={12}>
                    {userApprovedGroupHeaders.length === 0 ? (
                      <Grid item xs={12}>
                        {t("User is not in any approver groups")}
                      </Grid>
                    ) : (
                      <Grid item xs={12}>
                        {userApprovedGroupHeaders
                          .filter(e => !groupsToRemove.includes(e.id))
                          .map((n: ApproverGroupHeader, i) =>
                            n.variesByLocation ? (
                              <>
                                <div
                                  key={n.id}
                                  className={classes.displayInline}
                                >
                                  {t(`${n.name}`)}
                                  {n.approverGroups &&
                                    n.approverGroups.map((x: any, j) => (
                                      <>
                                        <div
                                          key={j}
                                          className={clsx(
                                            classes.indent,
                                            classes.displayInline
                                          )}
                                        >
                                          {x.location.name}
                                          {editingThis && (
                                            <TextButton
                                              className={clsx(
                                                classes.actionLink,
                                                classes.displayInline
                                              )}
                                              onClick={() => {
                                                groupsToRemove.push(x.id);
                                              }}
                                            >
                                              {t("Remove")}
                                            </TextButton>
                                          )}
                                        </div>
                                      </>
                                    ))}
                                </div>
                              </>
                            ) : (
                              <>
                                <div key={i} className={classes.displayInline}>
                                  {t(`${n.name}`)}{" "}
                                  {n.approvalWorkflows &&
                                    `(${n.approvalWorkflows.length} workflows)`}{" "}
                                  {editingThis && (
                                    <TextButton
                                      className={clsx(
                                        classes.actionLink,
                                        classes.displayInline
                                      )}
                                      onClick={() => {
                                        groupsToRemove.push(
                                          n.approverGroups[0]!.id
                                        );
                                      }}
                                    >
                                      {t("Remove")}
                                    </TextButton>
                                  )}
                                </div>
                              </>
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
    </>
  );
};

const useStyles = makeStyles(theme => ({
  fontBold: {
    fontWeight: "bold",
  },
  displayInline: {
    display: "line-block",
  },
  actionLink: {
    color: theme.customColors.darkRed,
  },
  indent: {
    marginLeft: theme.spacing(2),
  },
}));
