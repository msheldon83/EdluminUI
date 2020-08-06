import * as React from "react";
import { useMemo, useState } from "react";
import {
  Typography,
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
  InputLabel,
} from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { Chip } from "@material-ui/core";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { usePermissionSets } from "reference-data/permission-sets";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Formik } from "formik";
import * as yup from "yup";
import { OptionTypeBase } from "react-select/src/types";
import { PeopleGridItem } from "../people-grid-item";
import { usePositionTypes } from "reference-data/position-types";
import { useLocationGroups } from "reference-data/location-groups";
import { useLocations } from "reference-data/locations";
import { ActionButtons } from "../../../../components/action-buttons";

const editableSections = {
  accessControl: "edit-access-control",
};

type Props = {
  editing: string | null;
  editable: boolean;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  isCreate?: boolean;
  label: string;
  orgId: string;
  locations: Array<{ name: string } | null>;
  locationIds: Array<string | null> | null | undefined;
  locationGroups: Array<{ name: string } | null>;
  locationGroupIds: Array<string | null> | null | undefined;
  positionTypes: Array<{ name: string } | null>;
  positionTypeIds: Array<string | null> | null | undefined;
  allLocationIdsInScope: boolean;
  allPositionTypeIdsInScope: boolean;
  isSuperUser: boolean;
  permissionSet?:
    | {
        id: string;
        name: string;
        orgUserRole?: OrgUserRole | null | undefined;
      }
    | null
    | undefined;
  onSubmit: (admin: any) => Promise<unknown>;
  onCancel: () => void;
};

export const AccessControl: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [locationGroupsSelected, setLocationGroupsSelected] = useState<
    string[]
  >([]);

  const editingThis = props.editing === editableSections.accessControl;

  const positionTypes = usePositionTypes(props.orgId);
  const positionTypesOptions: OptionType[] = useMemo(
    () => positionTypes.map(p => ({ label: p.name, value: p.id })),
    [positionTypes]
  );

  const locations = useLocations(props.orgId);
  const locationOptions: OptionType[] = useMemo(
    () =>
      locations
        .filter(l => !locationGroupsSelected.includes(l.locationGroupId))
        .map(p => ({ label: p.name, value: p.id })),
    [locations, locationGroupsSelected]
  );

  const locationGroups = useLocationGroups(props.orgId);
  const locationGroupOptions: OptionType[] = useMemo(
    () => locationGroups.map(p => ({ label: p.name, value: p.id })),
    [locationGroups]
  );

  const permissionSets = usePermissionSets(props.orgId, [
    OrgUserRole.Administrator,
  ]);
  const permissionSetOptions: OptionType[] = useMemo(
    () =>
      permissionSets
        .filter(p => !p.isShadowRecord)
        .map(p => ({ label: p.name, value: p.id })),
    [permissionSets]
  );

  let permissions = props.isSuperUser ? t("Org Admin") : "";
  if (props.permissionSet) {
    permissions = props.permissionSet?.name ?? t("No Permissions Defined");
  }

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          isSuperUser: props.isSuperUser,
          permissionSetId: props.permissionSet?.id ?? "",
          allLocationIdsInScope: props.allLocationIdsInScope,
          allPositionTypeIdsInScope: props.allPositionTypeIdsInScope,
          positionTypeIds: props.positionTypeIds ?? [],
          locationIds: props.locationIds ?? [],
          locationGroupIds: props.locationGroupIds ?? [],
        }}
        onSubmit={async (data, e) => {
          await props.onSubmit({
            isSuperUser: data.isSuperUser,
            permissionSet: data.isSuperUser
              ? null
              : { id: data.permissionSetId },
            accessControl: data.isSuperUser
              ? null
              : {
                  allLocationIdsInScope: data.allLocationIdsInScope,
                  allPositionTypeIdsInScope: data.allPositionTypeIdsInScope,
                  locations: data.allLocationIdsInScope
                    ? null
                    : data.locationIds.map(l => ({ id: l })),
                  locationGroups: data.allLocationIdsInScope
                    ? null
                    : data.locationGroupIds.map(l => ({ id: l })),
                  positionTypes: data.allPositionTypeIdsInScope
                    ? null
                    : data.positionTypeIds.map(l => ({ id: l })),
                },
          });
        }}
        validationSchema={yup.object({
          isSuperUser: yup.boolean(),
          permissionSetId: yup.string().when("isSuperUser", {
            is: true,
            then: yup.string().nullable(),
            otherwise: yup
              .string()
              .nullable()
              .required(t("A permission set is required")),
          }),
          allLocationIdsInScope: yup.boolean(),
          allPositionTypeIdsInScope: yup.boolean(),
          positionTypeIds: yup
            .array(yup.string())
            .when(["allPositionTypeIdsInScope", "isSuperUser"], {
              is: (allPositionTypeIdsInScope, isSuperUser) =>
                allPositionTypeIdsInScope || isSuperUser,
              then: yup.array(yup.string()).nullable(),
              otherwise: yup
                .array(yup.string())
                .nullable()
                .required(t("A position type selection is required")),
            }),
          locationGroupIds: yup.array(yup.string()).nullable(),
          locationIds: yup
            .array(yup.string())
            .when(
              ["allLocationIdsInScope", "locationGroupIds", "isSuperUser"],
              {
                is: (allLocationIdsInScope, locationGroupIds, isSuperUser) =>
                  allLocationIdsInScope ||
                  isSuperUser ||
                  (!allLocationIdsInScope && locationGroupIds.length > 0),
                then: yup.array(yup.string()).nullable(),
                otherwise: yup
                  .array(yup.string())
                  .nullable()
                  .required(t("A location or location group is required")),
              }
            ),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              {!props.isCreate && (
                <SectionHeader
                  title={t("Access Control")}
                  actions={[
                    {
                      text: t("Edit"),
                      visible: !props.editing && props.editable,
                      execute: () => {
                        props.setEditing!(editableSections.accessControl);
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
                    text: props.label,
                    visible: editingThis,
                    execute: submitForm,
                  }}
                />
              )}
              <Grid container spacing={2}>
                <Grid container item spacing={2} xs={8}>
                  {props.isSuperUser && !editingThis && (
                    <Grid item xs={12} sm={6} lg={6}>
                      <Typography variant="h6">
                        {t("Organization Super User")}
                      </Typography>
                    </Grid>
                  )}
                  {editingThis && (
                    <Grid item xs={12} sm={6} lg={6}>
                      <FormControlLabel
                        label={t("Org Super User")}
                        control={
                          <Checkbox
                            checked={values.isSuperUser}
                            onChange={e =>
                              setFieldValue("isSuperUser", e.target.checked)
                            }
                            value={values.isSuperUser}
                            color="primary"
                            disabled={
                              props.editing !== editableSections.accessControl
                            }
                          />
                        }
                      />
                    </Grid>
                  )}
                  {!values.isSuperUser && (
                    <>
                      <Grid item xs={12} sm={6} lg={6}>
                        <PeopleGridItem
                          title={t("Permissions")}
                          description={
                            editingThis ? (
                              <SelectNew
                                value={
                                  permissionSetOptions.find(
                                    e =>
                                      e.value &&
                                      e.value === values.permissionSetId
                                  ) ?? { label: "", value: "" }
                                }
                                multiple={false}
                                onChange={(value: OptionType) => {
                                  const id = (value as OptionTypeBase).value;
                                  setFieldValue("permissionSetId", id);
                                }}
                                options={permissionSetOptions}
                                inputStatus={
                                  errors.permissionSetId ? "error" : undefined
                                }
                                validationMessage={errors.permissionSetId}
                              />
                            ) : (
                              permissions
                            )
                          }
                        />
                      </Grid>
                      {!editingThis && <Grid item xs={12} sm={6} lg={6} />}
                      <Grid item xs={12} sm={6} lg={6}>
                        <Typography variant="h6">
                          {t("Manages Locations")}
                        </Typography>
                        {!editingThis ? (
                          <div>
                            {props.allLocationIdsInScope || props.isSuperUser
                              ? t("All")
                              : props.locations.length === 0 &&
                                props.locationGroups.length === 0 &&
                                t("None")}
                            {!props.allLocationIdsInScope &&
                              props.locationGroups.length > 0 &&
                              props.locationGroups.map(
                                (locationGroup: { name: string } | null) =>
                                  locationGroup && (
                                    <Chip
                                      key={locationGroup.name}
                                      label={locationGroup.name}
                                      className={classes.locationGroupChip}
                                    />
                                  )
                              )}
                            {!props.allLocationIdsInScope &&
                              props.locations.length > 0 &&
                              props.locations.map(
                                (location: { name: string } | null) =>
                                  location && (
                                    <Chip
                                      key={location.name}
                                      label={location.name}
                                      className={classes.locationChip}
                                    />
                                  )
                              )}
                          </div>
                        ) : (
                          <>
                            <FormControlLabel
                              label={t("All Locations")}
                              control={
                                <Checkbox
                                  checked={values.allLocationIdsInScope}
                                  onChange={e =>
                                    setFieldValue(
                                      "allLocationIdsInScope",
                                      e.target.checked
                                    )
                                  }
                                  value={values.allLocationIdsInScope}
                                  color="primary"
                                  disabled={
                                    props.editing !==
                                    editableSections.accessControl
                                  }
                                />
                              }
                            />
                            {!values.allLocationIdsInScope && (
                              <>
                                <div>
                                  <InputLabel>
                                    {t("Location Groups")}
                                  </InputLabel>
                                  <SelectNew
                                    onChange={e => {
                                      const ids = e.map((v: OptionType) =>
                                        v.value.toString()
                                      );
                                      setFieldValue("locationGroupIds", ids);
                                      setLocationGroupsSelected(ids);
                                    }}
                                    options={locationGroupOptions}
                                    value={
                                      locationGroupOptions.filter(
                                        e =>
                                          e.value &&
                                          values.locationGroupIds.includes(
                                            e.value.toString()
                                          )
                                      ) ?? { label: "", value: "" }
                                    }
                                    multiple={true}
                                  />
                                </div>
                                <div>
                                  <InputLabel>{t("Locations")}</InputLabel>
                                  <SelectNew
                                    onChange={e => {
                                      const ids = e.map((v: OptionType) =>
                                        v.value.toString()
                                      );
                                      setFieldValue("locationIds", ids);
                                    }}
                                    options={locationOptions}
                                    value={
                                      locationOptions.filter(
                                        e =>
                                          e.value &&
                                          values.locationIds.includes(
                                            e.value.toString()
                                          )
                                      ) ?? { label: "", value: "" }
                                    }
                                    multiple={true}
                                    inputStatus={
                                      errors.locationIds ? "error" : undefined
                                    }
                                    validationMessage={
                                      Array.isArray(errors.locationIds)
                                        ? errors.locationIds[0]
                                        : errors.locationIds
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <Typography variant="h6">
                          {t("Manages Position Types")}
                        </Typography>
                        {!editingThis ? (
                          <div>
                            {props.allPositionTypeIdsInScope
                              ? t("All")
                              : props.positionTypes.length === 0 && t("None")}
                            {!props.allPositionTypeIdsInScope &&
                              !props.isSuperUser &&
                              props.positionTypes.length > 0 &&
                              props.positionTypes.map(
                                (positionType: { name: string } | null) =>
                                  positionType && (
                                    <Chip
                                      key={positionType.name}
                                      label={positionType.name}
                                      className={classes.positionTypeChip}
                                    />
                                  )
                              )}
                          </div>
                        ) : (
                          <>
                            <FormControlLabel
                              label={t("All Position Types")}
                              control={
                                <Checkbox
                                  checked={values.allPositionTypeIdsInScope}
                                  onChange={e =>
                                    setFieldValue(
                                      "allPositionTypeIdsInScope",
                                      e.target.checked
                                    )
                                  }
                                  value={values.allPositionTypeIdsInScope}
                                  color="primary"
                                  disabled={
                                    props.editing !==
                                    editableSections.accessControl
                                  }
                                />
                              }
                            />
                            {!values.allPositionTypeIdsInScope && (
                              <>
                                <InputLabel>{t("Position Types")}</InputLabel>
                                <SelectNew
                                  onChange={e => {
                                    const ids = e.map((v: OptionType) =>
                                      v.value.toString()
                                    );
                                    setFieldValue("positionTypeIds", ids);
                                  }}
                                  options={positionTypesOptions}
                                  value={
                                    positionTypesOptions.filter(
                                      e =>
                                        e.value &&
                                        values.positionTypeIds.includes(
                                          e.value.toString()
                                        )
                                    ) ?? { label: "", value: "" }
                                  }
                                  multiple={true}
                                  inputStatus={
                                    errors.positionTypeIds ? "error" : undefined
                                  }
                                  validationMessage={
                                    Array.isArray(errors.positionTypeIds)
                                      ? errors.positionTypeIds[0]
                                      : errors.positionTypeIds
                                  }
                                />
                              </>
                            )}
                          </>
                        )}
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
              {props.isCreate && (
                <ActionButtons
                  submit={{ text: props.label, execute: submitForm }}
                  cancel={{ text: t("Cancel"), execute: props.onCancel }}
                />
              )}
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  locationChip: {
    background: theme.customColors.mediumBlue,
    color: theme.customColors.white,
  },
  locationGroupChip: {
    background: theme.customColors.blue,
    color: theme.customColors.white,
  },
  positionTypeChip: {
    background: theme.customColors.blue,
    color: theme.customColors.white,
  },
}));
