import * as React from "react";
import { useMemo, useState } from "react";
import { Grid, makeStyles, InputLabel } from "@material-ui/core";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import { PermissionEnum, ApproverGroupHeader } from "graphql/server-types.gen";
import { SectionHeader } from "ui/components/section-header";
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
  approverGroupHeaders: any[];
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmit: (add: string[], remove: string[]) => Promise<unknown>;
  onCancel: () => void;
};

export const ApproverGroupMembership: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [locationsSelected, setLocationsSelected] = useState<string[]>([]);

  const [approverGroupsSelected, setApproverGroupsSelected] = useState<
    string[]
  >([]);

  const editingThis =
    props.editing === editableSections.approverGroupMembership;

  const approverGroups = useApproverGroups(props.orgId);
  const approverGroupOptions: OptionType[] = useMemo(
    () =>
      approverGroups
        .filter(l => !approverGroupsSelected.includes(l.id))
        .map(p => ({ label: p.name, value: p.id })),
    [approverGroups, approverGroupsSelected]
  );

  const locations = useLocations(props.orgId);
  const locationOptions: OptionType[] = useMemo(
    () =>
      locations
        .filter(l => !locationsSelected.includes(l.locationGroupId))
        .map(p => ({ label: p.name, value: p.id })),
    [locations, locationsSelected]
  );

  console.log(props.approverGroupHeaders);

  return (
    <>
      <Formik
        initialValues={{
          approverGroupIds:
            props?.approverGroupHeaders?.map(e =>
              e.approverGroups.map((x: any) => {
                x?.id;
              })
            ) ?? [],
          locationIds:
            props?.approverGroupHeaders
              ?.filter(e => e.variesByLocation)
              .map(x =>
                x.approverGroups.map((c: any) => {
                  c.locationId;
                })
              ) ?? [],
        }}
        onSubmit={async (data, e) => {
          //await props.onSubmit({});
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
                            const ids = e.map((v: OptionType) =>
                              v.value.toString()
                            );
                            setFieldValue("approverGroupIds", ids);
                            setApproverGroupsSelected(ids);
                          }}
                          options={approverGroupOptions}
                          value={
                            approverGroupOptions.filter(
                              e =>
                                e.value &&
                                values.approverGroupIds.includes(
                                  e.value.toString()
                                )
                            ) ?? { label: "", value: "" }
                          }
                          multiple={true}
                        />
                      </Grid>
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
                                values.locationIds.includes(e.value.toString())
                            ) ?? { label: "", value: "" }
                          }
                          multiple={true}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid container item spacing={2} xs={8}>
                    {props.approverGroupHeaders.length === 0 ? (
                      <Grid item xs={12}>
                        {t("User is not in any approver groups")}
                      </Grid>
                    ) : (
                      <Grid item xs={12}>
                        {props.approverGroupHeaders //.filter(e=> !e.variesByLocation)
                          .map((n, i) => (
                            <div key={i}>
                              {t(`${n.name}`)}{" "}
                              {n.approvalWorkflows.length &&
                                `(${n.approvalWorkflows.length} workflows)`}
                            </div>
                          ))}
                        {/* {
                            props.approverGroupHeaders.filter(e => e.variesByLocation).map((n, i) => (

                              <div key={i}>{n.name}</div>

                            ))
                          } */}
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
}));
