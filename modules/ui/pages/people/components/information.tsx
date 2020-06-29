import {
  Divider,
  Grid,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { isValid, parseISO } from "date-fns";
import { Formik } from "formik";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  CountryCode,
  OrgUserRole,
  PermissionEnum,
  StateCode,
} from "graphql/server-types.gen";
import { formatIsoDateIfPossible } from "helpers/date";
import { phoneRegExp } from "helpers/regexp";
import { useBreakpoint } from "hooks";
import { useSnackbar } from "hooks/use-snackbar";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { usePermissionSets } from "reference-data/permission-sets";
import { USStates } from "reference-data/states";
import { Can } from "ui/components/auth/can";
import { AvatarCard } from "ui/components/avatar-card";
import { ShowErrors } from "ui/components/error-helpers";
import { DateInput } from "ui/components/form/date-input";
import { Input } from "ui/components/form/input";
import { PhoneNumberInput } from "ui/components/form/phone-number-input";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { getInitials } from "ui/components/helpers";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { TextButton } from "ui/components/text-button";
import { ResetPassword } from "ui/pages/profile/graphql/ResetPassword.gen";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { GetOrgUserLastLogin } from "../graphql/get-orguser-lastlogin.gen";
import { PeopleGridItem } from "./people-grid-item";

export const editableSections = {
  information: "edit-information",
};

export type OrgUser = {
  id?: string | null | undefined;
  orgId?: string | null | undefined;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
  address1?: string | null | undefined;
  address2?: string | null | undefined;
  city?: string | null | undefined;
  state?: StateCode | null | undefined;
  country?: CountryCode | null | undefined;
  postalCode?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  dateOfBirth?: Date | string | null | undefined;
  permissionSet?: { id?: string | null | undefined } | null | undefined;
  active?: boolean | null;
};

type Props = {
  editing: string | null;
  editable: boolean;
  isCreate?: boolean;
  userId?: string | null | undefined;
  loginEmail?: string | null | undefined;
  orgUser: OrgUser;
  permissionSet?:
    | {
        id: string;
        name: string;
        orgUserRole?: OrgUserRole | null | undefined;
      }
    | null
    | undefined;
  isSuperUser: boolean;
  selectedRole: OrgUserRole;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmit?: (orgUser: any) => Promise<unknown>;
  onCancel?: () => void;
  editPermissions?: PermissionEnum[];
  temporaryPassword?: string;
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
    const response = await resetPassword({
      variables: {
        resetPasswordInput: {
          id: props.userId ?? "",
          orgId: orgUser.orgId,
        },
      },
    });
    const result = response?.data?.user?.resetPassword;
    if (result) {
      openSnackbar({
        message: t("Reset password email has been sent"),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
    }
  };

  const getOrgUserLastLogin = useQueryBundle(GetOrgUserLastLogin, {
    variables: { id: props.orgUser.id },
    skip: props.isCreate,
    onError: error => {
      // This shouldn't blow up the page
    },
  });

  const lastLogin =
    getOrgUserLastLogin.state === "LOADING"
      ? undefined
      : getOrgUserLastLogin?.data?.orgUser?.lastLoginById?.lastLogin;

  const formattedLoginTime = formatIsoDateIfPossible(
    lastLogin ? lastLogin : null,
    "MMM d, yyyy h:mm a"
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

  const permissionSets = usePermissionSets(orgUser.orgId, [props.selectedRole]);
  const permissionSetOptions: OptionType[] = permissionSets
    .filter(ps => !ps.isShadowRecord)
    .map(ps => ({
      label: ps.name,
      value: ps.id,
    }));

  let permissions = props.isSuperUser ? t("Org Admin") : "";
  if (props.permissionSet) {
    permissions = props.permissionSet?.name ?? t("No Permissions Defined");
  }

  const stateOptions = USStates.map(s => ({
    label: s.name,
    value: s.enumValue,
  }));

  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

  const phoneFieldLabel =
    props.selectedRole === OrgUserRole.ReplacementEmployee &&
    props.editing == "edit-information"
      ? t("Phone (mobile preferred)")
      : t("Phone");

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          email: orgUser.email,
          phoneNumber: orgUser.phoneNumber ?? "",
          address1: orgUser.address1 ?? "",
          city: orgUser.city ?? "",
          state: orgUser.state ?? undefined,
          postalCode: orgUser.postalCode ?? "",
          dateOfBirth: orgUser.dateOfBirth
            ? parseISO(orgUser.dateOfBirth.toString())
            : undefined,
          permissionSetId: props.permissionSet?.id ?? "",
          orgUserRole: props.selectedRole,
        }}
        onSubmit={async (data, e) => {
          await props.onSubmit!({
            email: data.email,
            phoneNumber:
              data.phoneNumber.trim().length === 0
                ? null
                : cleanPhoneNumber(data.phoneNumber),
            dateOfBirth: isValid(data.dateOfBirth) ? data.dateOfBirth : null,
            address1: data.address1.trim().length === 0 ? null : data.address1,
            city: data.city.trim().length === 0 ? null : data.city,
            state: data.state ?? null,
            postalCode:
              data.postalCode.trim().length === 0 ? null : data.postalCode,
            country: data.state ? ("US" as CountryCode) : null,
            permissionSet: data.permissionSetId
              ? { id: data.permissionSetId }
              : undefined,
          });
        }}
        validationSchema={yup.object({
          orgUserRole: yup.string(),
          permissionSetId: yup.string().when("orgUserRole", {
            is: OrgUserRole.Administrator,
            then: yup.string().nullable(),
            otherwise: yup
              .string()
              .nullable()
              .required(t("Permission Set is required")),
          }),
          email: yup.string().email(t("Invalid Email Address")),
          phoneNumber: yup.string().when("orgUserRole", {
            is: OrgUserRole.ReplacementEmployee,
            then: yup
              .string()
              .nullable()
              .required(t("Phone Number is required"))
              .matches(phoneRegExp, t("Phone Number Is Not Valid")),
            otherwise: yup
              .string()
              .nullable()
              .matches(phoneRegExp, t("Phone Number Is Not Valid")),
          }),
          dateOfBirth: yup.date(),
          postalCode: yup
            .number()
            .nullable()
            .min(5)
            .notRequired()
            .test("address1", t("Postal Code is required"), function(value) {
              if (value) return true;

              if (this.resolve(yup.ref("address1"))) {
                return this.createError({
                  message: t(
                    "Postal Code is required when an address is entered"
                  ),
                });
              }
              if (this.resolve(yup.ref("city"))) {
                return this.createError({
                  message: t("Postal Code is required when a city is entered"),
                });
              }
              if (this.resolve(yup.ref("state"))) {
                return this.createError({
                  message: t("Postal Code is required when a state is choosen"),
                });
              }
              return true;
            }),
          address1: yup
            .string()
            .nullable()
            .notRequired()
            .test("city", t("Address is required"), function(value) {
              const sibling = this.resolve(yup.ref("city"));
              if (value) return true;

              if (this.resolve(yup.ref("city"))) {
                return this.createError({
                  message: t("Address is required when a city is entered"),
                });
              }
              if (this.resolve(yup.ref("state"))) {
                return this.createError({
                  message: t("Address is required when a state is choosen"),
                });
              }
              if (this.resolve(yup.ref("postalCode"))) {
                return this.createError({
                  message: t(
                    "Address is required when a postal code is choosen"
                  ),
                });
              }
              return true;
            }),
          city: yup
            .string()
            .nullable()
            .notRequired()
            .test("address1", t("City is required"), function(value) {
              if (value) return true;

              if (this.resolve(yup.ref("address1"))) {
                return this.createError({
                  message: t("City is required when an address is entered"),
                });
              }
              if (this.resolve(yup.ref("state"))) {
                return this.createError({
                  message: t("City is required when a state is choosen"),
                });
              }
              if (this.resolve(yup.ref("postalCode"))) {
                return this.createError({
                  message: t("City is required when a postal code is choosen"),
                });
              }
              return true;
            }),
          state: yup
            .string()
            .nullable()
            .notRequired()
            .test("address1", t("State is required"), function(value) {
              const sibling = this.resolve(yup.ref("address1"));
              if (value) return true;

              if (this.resolve(yup.ref("address1"))) {
                return this.createError({
                  message: t("State is required when an address is entered"),
                });
              }
              if (this.resolve(yup.ref("city"))) {
                return this.createError({
                  message: t("State is required when a city is entered"),
                });
              }
              if (this.resolve(yup.ref("postalCode"))) {
                return this.createError({
                  message: t("State is required when a postal code is choosen"),
                });
              }
              return true;
            }),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section className={classes.customSection}>
              {!props.isCreate && (
                <SectionHeader
                  title={t("Information")}
                  actions={[
                    {
                      text: t("Edit"),
                      visible: !props.editing && props.editable,
                      execute: () => {
                        props.setEditing!(editableSections.information);
                      },
                      permissions: props.editPermissions,
                    },
                  ]}
                  submit={{
                    text: t("Save"),
                    visible: props.editing === editableSections.information,
                    execute: submitForm,
                  }}
                  cancel={{
                    text: t("Cancel"),
                    visible: props.editing === editableSections.information,
                    execute: () => {
                      props.setEditing!(null);
                    },
                  }}
                />
              )}
              <Grid container>
                <Grid container item xs={8} component="dl" spacing={2}>
                  <Grid container item xs={6} spacing={2}>
                    {props.selectedRole !== OrgUserRole.Administrator && (
                      <PeopleGridItem
                        title={t("Permissions")}
                        description={
                          props.editing === editableSections.information &&
                          !props.isSuperUser ? (
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
                              withResetValue={false}
                            />
                          ) : (
                            permissions
                          )
                        }
                      />
                    )}
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
                      title={phoneFieldLabel}
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
                              <SelectNew
                                value={{
                                  value: values.state ?? "",
                                  label:
                                    stateOptions.find(
                                      a => a.value === values.state
                                    )?.label || "",
                                }}
                                multiple={false}
                                onChange={(e: OptionType) => {
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
                            <Grid item xs={6}>
                              <TextButton
                                onClick={() => {
                                  setFieldValue("address1", "");
                                  setFieldValue("city", "");
                                  setFieldValue("postalCode", "");
                                  setFieldValue("state", null);
                                }}
                              >
                                {t("Clear address")}
                              </TextButton>
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
                    {props.editing === editableSections.information ? (
                      <PeopleGridItem
                        title={t("Date of Birth")}
                        description={
                          <DateInput
                            value={values.dateOfBirth ?? ""}
                            placeholder="MMM DD, YYYY"
                            onChange={(date: string) =>
                              setFieldValue("dateOfBirth", date)
                            }
                            onValidDate={date =>
                              setFieldValue("dateOfBirth", date)
                            }
                          />
                        }
                      />
                    ) : (
                      <Grid item className={classes.label}>
                        <Typography variant="h6">
                          {t("Date of Birth")}
                        </Typography>
                        <Typography>{formattedBirthDate}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  {!props.isCreate && (
                    <>
                      <Grid item xs={12}>
                        <Divider
                          variant="fullWidth"
                          className={classes.divider}
                        />
                      </Grid>
                      <Grid container item xs={6} spacing={2}>
                        <PeopleGridItem
                          title={t("Username")}
                          description={props.loginEmail}
                        />
                        {orgUser.active && (
                          <Can do={[PermissionEnum.UserResetPassword]}>
                            {props.temporaryPassword ? (
                              <PeopleGridItem
                                title={
                                  <span className={classes.resetPassword}>
                                    <span className={classes.tempPasswordLabel}>
                                      {t("Temporary Password")}{" "}
                                    </span>
                                    <Tooltip
                                      title={
                                        <div className={classes.tooltip}>
                                          <Typography variant="body1">
                                            {t(
                                              "The user can use this password to finish setting up their account. On their first login they will be prompted to specify their own password."
                                            )}
                                          </Typography>
                                        </div>
                                      }
                                      placement="right-start"
                                    >
                                      <InfoIcon
                                        color="primary"
                                        style={{
                                          fontSize: "16px",
                                          marginLeft: "8px",
                                        }}
                                      />
                                    </Tooltip>
                                  </span>
                                }
                                description={props.temporaryPassword}
                              />
                            ) : (
                              <PeopleGridItem
                                title={
                                  <span className={classes.resetPassword}>
                                    {t("Password")}{" "}
                                    <Tooltip
                                      title={
                                        <div className={classes.tooltip}>
                                          <Typography variant="body1">
                                            {t(
                                              "Reset password will send the user an email with a link to reset the password."
                                            )}
                                          </Typography>
                                        </div>
                                      }
                                      placement="right-start"
                                    >
                                      <InfoIcon
                                        color="primary"
                                        style={{
                                          fontSize: "16px",
                                          marginLeft: "8px",
                                        }}
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
                            )}
                          </Can>
                        )}
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
                    </>
                  )}
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
              {props.isCreate && (
                <ActionButtons
                  submit={{ text: t("Next"), execute: submitForm }}
                  cancel={{ text: t("Cancel"), execute: props.onCancel! }}
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
  label: {
    padding: theme.spacing(1),
  },
  tempPasswordLabel: {
    fontWeight: "bold",
  },
}));
