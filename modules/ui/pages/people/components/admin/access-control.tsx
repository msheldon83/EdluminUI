import * as React from "react";
import {
  Typography,
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { Chip } from "@material-ui/core";
import {
  OrgUserRole,
  PermissionEnum,
  AdministratorInput,
} from "graphql/server-types.gen";
import { usePermissionSets } from "reference-data/permission-sets";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Formik } from "formik";
import { OptionTypeBase } from "react-select/src/types";
import { PeopleGridItem } from "../people-grid-item";

const editableSections = {
  accessControl: "edit-access-control",
};

export type AdminAccessControl = {};

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  orgId: number;
  locations: Array<{ name: string } | null>;
  locationGroups: Array<{ name: string } | null>;
  positionTypes: Array<{ name: string } | null>;
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
};

const handleCheckSuperUser = () => {};

export const AccessControl: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const editingThis = props.editing === editableSections.accessControl;

  const permissionSets = usePermissionSets(props.orgId.toString(), [
    OrgUserRole.Administrator,
  ]);
  const permissionSetOptions: OptionType[] = permissionSets.map(ps => ({
    label: ps.name,
    value: ps.id,
  }));

  let permissions = props.isSuperUser ? t("Org Admin") : "";
  if (props.permissionSet) {
    permissions = props.permissionSet?.name ?? t("No Permissions Defined");
  }

  return (
    <>
      <Formik
        initialValues={{
          isSuperUser: props.isSuperUser,
          permissionSetId: props.permissionSet?.id ?? "",
          allLocationIdsInScope: props.allLocationIdsInScope,
          allPositionTypeIdsInScope: props.allPositionTypeIdsInScope,
        }}
        onSubmit={async (data, e) => {
          await props.onSubmit({
            isSuperUser: data.isSuperUser,
            permissionSet: data.isSuperUser
              ? null
              : { id: Number(data.permissionSetId) },
            accessControl: data.isSuperUser
              ? null
              : {
                  allLocationIdsInScope: data.allLocationIdsInScope,
                  allPositionTypeIdsInScope: data.allPositionTypeIdsInScope,
                  locations: data.allLocationIdsInScope ? null : [],
                  locationGroups: data.allLocationIdsInScope ? null : [],
                  positionTypes: data.allPositionTypeIdsInScope ? null : [],
                },
          });
        }}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader
                title={t("Access Control")}
                action={{
                  text: t("Edit"),
                  visible: !props.editing,
                  execute: () => {
                    props.setEditing(editableSections.accessControl);
                  },
                  permissions: [PermissionEnum.AdminSave],
                }}
                cancel={{
                  text: t("Cancel"),
                  visible: editingThis,
                  execute: () => {
                    props.setEditing(null);
                  },
                }}
                submit={{
                  text: t("Save"),
                  visible: editingThis,
                  execute: submitForm,
                }}
              />
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
                                value={permissionSetOptions.find(
                                  e => e.value && values.permissionSetId
                                )}
                                multiple={false}
                                onChange={(value: OptionType) => {
                                  const id = [(value as OptionTypeBase).value];
                                  setFieldValue("permissionSetId", id);
                                }}
                                options={permissionSetOptions}
                              />
                            ) : (
                              permissions
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <Typography variant="h6">
                          {t("Manages Locations")}
                        </Typography>
                        <div>
                          {props.allLocationIdsInScope || props.isSuperUser
                            ? t("All")
                            : props.locations.length === 0 &&
                              props.locationGroups.length === 0 &&
                              t("None")}
                          {!props.allLocationIdsInScope &&
                            !props.isSuperUser &&
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
                          {!props.allLocationIdsInScope &&
                            !props.isSuperUser &&
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
                        </div>
                      </Grid>
                      <Grid item xs={12} sm={6} lg={6}>
                        <Typography variant="h6">
                          {t("Position type scope")}
                        </Typography>
                        <div>
                          {props.allPositionTypeIdsInScope || props.isSuperUser
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
                      </Grid>
                    </>
                  )}
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
