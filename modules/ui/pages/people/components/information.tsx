import * as React from "react";
import {
  Typography,
  Divider,
  Grid,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { formatIsoDateIfPossible } from "helpers/date";
import { isValid, parseISO } from "date-fns";
import { TextButton } from "ui/components/text-button";
import { AvatarCard } from "ui/components/avatar-card";
import { useBreakpoint } from "hooks";
import { getInitials } from "ui/components/helpers";
import { PhoneNumberInput } from "ui/components/form/phone-number-input";
import {
  StateCode,
  CountryCode,
  OrgUserRole,
  OrgUserUpdateInput,
  PermissionEnum,
} from "graphql/server-types.gen";
import { PeopleGridItem } from "./people-grid-item";
import * as yup from "yup";
import { Formik } from "formik";
import { Input } from "ui/components/form/input";
import { Select, SelectValueType } from "ui/components/form/select";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { USStates } from "reference-data/states";
import { OptionTypeBase } from "react-select/src/types";
import { DateInput } from "ui/components/form/date-picker";
import { usePermissionSets } from "reference-data/permission-sets";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { GetOrgUserLastLogin } from "../graphql/get-orguser-lastlogin.gen";
import { Can } from "ui/components/auth/can";

const editableSections = {
  information: "edit-information",
};

type Props = {
  editing: string | null;
  userId?: number | null | undefined;
  loginEmail?: string | null | undefined;
  orgUser: {
    id: string;
    orgId: number;
    rowVersion?: string | null | undefined; // This is the row version of the employee, not of the orgUser.
    firstName: string;
    lastName: string;
    email: string;
    address1?: string | null | undefined;
    address2?: string | null | undefined;
    city?: string | null | undefined;
    state?: StateCode | null | undefined;
    country?: CountryCode | null | undefined;
    postalCode?: string | null | undefined;
    phoneNumber?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    permissionSet?:
      | {
          id: string;
          name: string;
          orgUserRole?: OrgUserRole | null | undefined;
        }
      | null
      | undefined;
  };
  orgUserRowVersion: string;
  isSuperUser: boolean;
  selectedRole: OrgUserRole;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  onSaveOrgUser: (orgUser: OrgUserUpdateInput) => Promise<unknown>;
  editPermissions?: PermissionEnum[];
};

export const Information: React.FC<Props> = props => {
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const orgUser = props.orgUser;
  const { t } = useTranslation();
  const isSmDown = useBreakpoint("sm", "down");

  const [resetPassword] = useMutationBundle(ResetPassword, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const onResetPassword = async () => {
    await resetPassword({
      variables: { resetPasswordInput: { id: Number(props.userId) } },
    });
  };

  const getOrgUserLastLogin = useQueryBundle(GetOrgUserLastLogin, {
    variables: { id: props.orgUser.id },
    onError: error => {
      // This shouldn't blow up the page
      console.error(error);
    },
  });

  const lastLogin =
    getOrgUserLastLogin.state === "LOADING"
      ? undefined
      : getOrgUserLastLogin?.data?.orgUser?.lastLoginById?.lastLogin;

  const formattedLoginTime = formatIsoDateIfPossible(
    lastLogin ? lastLogin : null,
    "MMM d, yyyy h:m a"
  );

  const formattedBirthDate = formatIsoDateIfPossible(
    orgUser.dateOfBirth ? (
      orgUser.dateOfBirth
    ) : (
      <span className={classes.notSpecified}>{t("Not Specified")}</span>
    ),
    "MMM d, yyyy"
  );

  const initials = getInitials(props.orgUser);

  const permissionSets = usePermissionSets(orgUser.orgId.toString(), [
    props.selectedRole,
  ]);
  const permissionSetOptions = permissionSets.map(ps => ({
    label: ps.name,
    value: ps.id,
  }));

  let permissions = props.isSuperUser ? t("Org Admin") : "";
  if (orgUser.permissionSet) {
    permissions = orgUser?.permissionSet?.name ?? t("No Permissions Defined");
  }

  const stateOptions = USStates.map(s => ({
    label: s.name,
    value: s.enumValue,
  }));

  return (
    <>
      <Formik
        initialValues={{
          email: orgUser.email,
          phoneNumber: orgUser.phoneNumber ?? "",
          address1: orgUser.address1 ?? "",
          city: orgUser.city ?? "",
          state: orgUser.state ?? undefined,
          postalCode: orgUser.postalCode ?? "",
          dateOfBirth: orgUser.dateOfBirth
            ? parseISO(orgUser.dateOfBirth)
            : undefined,
          permissionSetId: orgUser.permissionSet?.id ?? "",
        }}
        onSubmit={async (data, e) => {
          await props.onSaveOrgUser({
            id: Number(orgUser.id),
            rowVersion: props.orgUserRowVersion,
            email: data.email,
            phoneNumber:
              data.phoneNumber.trim().length === 0 ? null : data.phoneNumber,
            dateOfBirth: isValid(data.dateOfBirth) ? data.dateOfBirth : null,
            address1: data.address1.trim().length === 0 ? null : data.address1,
            city: data.city.trim().length === 0 ? null : data.city,
            stateId: data.state,
            postalCode:
              data.postalCode.trim().length === 0 ? null : data.postalCode,
            countryId: data.state ? ("US" as CountryCode) : null,
            // TODO: handle permission set update
          });
        }}
        validationSchema={yup.object().shape({
          email: yup.string().required(t("Email is required")),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section className={classes.customSection}>
              <SectionHeader
                title={t("Information")}
                action={{
                  text: t("Edit"),
                  visible: !props.editing,
                  execute: () => {
                    props.setEditing(editableSections.information);
                  },
                  permissions: props.editPermissions,
                }}
                submit={{
                  text: t("Save"),
                  visible: props.editing === editableSections.information,
                  execute: submitForm,
                }}
                cancel={{
                  text: t("Cancel"),
                  visible: props.editing === editableSections.information,
                  execute: () => {
                    props.setEditing(null);
                  },
                }}
              />
              <Grid container>
                <Grid container item xs={8} component="dl" spacing={2}>
                  <Grid container item xs={6} spacing={2}>
                    <PeopleGridItem
                      title={t("Permissions")}
                      description={
                        props.editing === editableSections.information &&
                        !props.isSuperUser ? (
                          <Select
                            value={permissionSetOptions.filter(
                              e => e.value && values.permissionSetId
                            )}
                            onChange={value => {
                              const id = [(value as OptionTypeBase).value];
                              setFieldValue("permissionSetId", id);
                            }}
                            options={permissionSetOptions}
                            isClearable={false}
                          />
                        ) : (
                          permissions
                        )
                      }
                    />
                    <PeopleGridItem
                      title={t("Email")}
                      description={
                        props.editing === editableSections.information ? (
                          <Input
                            value={values.email}
                            InputComponent={FormTextField}
                            inputComponentProps={{
                              name: "email",
                              id: "email",
                            }}
                          />
                        ) : (
                          orgUser.email
                        )
                      }
                    />
                    <PeopleGridItem
                      title={t("Phone")}
                      description={
                        props.editing === editableSections.information ? (
                          <Input
                            value={values.phoneNumber}
                            InputComponent={FormTextField}
                            inputComponentProps={{
                              name: "phoneNumber",
                              id: "phoneNumber",
                            }}
                          />
                        ) : orgUser.phoneNumber ? (
                          <PhoneNumberInput
                            phoneNumber={orgUser.phoneNumber}
                            forViewOnly={true}
                          />
                        ) : (
                          <span className={classes.notSpecified}>
                            {t("Not specified")}
                          </span>
                        )
                      }
                    />
                  </Grid>
                  <Grid container item xs={6} spacing={2}>
                    <PeopleGridItem
                      title={t("Address")}
                      description={
                        props.editing === editableSections.information ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <div>{t("Street")}</div>
                              <Input
                                value={values.address1}
                                InputComponent={FormTextField}
                                inputComponentProps={{
                                  name: "address1",
                                  id: "address1",
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <div>{t("City")}</div>
                              <Input
                                value={values.city}
                                InputComponent={FormTextField}
                                inputComponentProps={{
                                  name: "city",
                                  id: "city",
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <div>{t("State")}</div>
                              <Select
                                value={{
                                  value: values.state,
                                  label:
                                    stateOptions.find(
                                      a => a.value === values.state
                                    )?.label || "",
                                }}
                                onChange={(e: SelectValueType) => {
                                  //TODO: Once the select component is updated,
                                  // can remove the Array checking
                                  let selectedValue = null;
                                  if (e) {
                                    if (Array.isArray(e)) {
                                      selectedValue = (e as Array<
                                        OptionTypeBase
                                      >)[0].value;
                                    } else {
                                      selectedValue = (e as OptionTypeBase)
                                        .value;
                                    }
                                  }
                                  setFieldValue("state", selectedValue);
                                }}
                                options={stateOptions}
                                isClearable={!!values.state}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <div>{t("Zip")}</div>
                              <Input
                                value={values.postalCode}
                                InputComponent={FormTextField}
                                inputComponentProps={{
                                  name: "postalCode",
                                  id: "postalCode",
                                }}
                              />
                            </Grid>
                          </Grid>
                        ) : !orgUser.address1 ? (
                          <span className={classes.notSpecified}>
                            {t("Not specified")}
                          </span>
                        ) : (
                          <>
                            <div>{orgUser.address1}</div>
                            <div>
                              {orgUser.address2 && `${orgUser.address2}`}
                            </div>
                            <div>{`${orgUser.city}, ${orgUser.state} ${orgUser.postalCode}`}</div>
                          </>
                        )
                      }
                    />
                    <PeopleGridItem
                      title={t("Date of Birth")}
                      description={
                        props.editing === editableSections.information ? (
                          <DateInput
                            value={values.dateOfBirth}
                            label={""}
                            onChange={e => setFieldValue("dateOfBirth", e)}
                            onValidDate={e => setFieldValue("dateOfBirth", e)}
                          />
                        ) : (
                          formattedBirthDate
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider variant="fullWidth" className={classes.divider} />
                  </Grid>
                  <Grid container item xs={6} spacing={2}>
                    <PeopleGridItem
                      title={t("Username")}
                      description={props.loginEmail}
                    />
                    <Can do={[PermissionEnum.UserResetPassword]}>
                      <PeopleGridItem
                        title={
                          <span className={classes.resetPassword}>
                            {t("Password")}{" "}
                            <Tooltip
                              title={
                                <div className={classes.tooltip}>
                                  <Typography variant="body1">
                                    Reset password will send the user an email
                                    with a link to reset the password.
                                  </Typography>
                                </div>
                              }
                              placement="right-start"
                            >
                              <InfoIcon
                                color="primary"
                                style={{ fontSize: "16px", marginLeft: "8px" }}
                              />
                            </Tooltip>
                          </span>
                        }
                        description={
                          <TextButton onClick={() => onResetPassword()}>
                            {t("Reset Password")}
                          </TextButton>
                        }
                      />
                    </Can>
                  </Grid>
                  <Grid container item xs={6} spacing={2}>
                    <PeopleGridItem
                      title={t("Last Login")}
                      description={
                        formattedLoginTime ? (
                          formattedLoginTime
                        ) : (
                          <span className={classes.notSpecified}>
                            {t("Not Available")}
                          </span>
                        )
                      }
                    />
                  </Grid>
                </Grid>
                <Grid container item spacing={2} xs={4}>
                  <Grid
                    item
                    container={isSmDown}
                    justify={isSmDown ? "center" : undefined}
                  >
                    <div className={classes.avatar}>
                      <AvatarCard initials={initials} />
                    </div>
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
  customSection: {
    borderRadius: `0 0 ${theme.typography.pxToRem(
      4
    )} ${theme.typography.pxToRem(4)}`,
  },
  divider: {
    marginBottom: theme.spacing(1),
  },
  avatar: {
    paddingLeft: theme.spacing(9),
  },
  notSpecified: {
    color: theme.customColors.edluminSubText,
  },
  resetPassword: {
    fontWeight: 400,
    fontSize: theme.typography.pxToRem(14),
    display: "flex",
    alignItems: "center",
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  tooltipTitle: {
    paddingBottom: theme.spacing(1),
  },
}));
