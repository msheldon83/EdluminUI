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
  PermissionEnum,
} from "graphql/server-types.gen";
import { PeopleGridItem } from "./people-grid-item";
import * as yup from "yup";
import { Formik } from "formik";
import { Input } from "ui/components/form/input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { USStates } from "reference-data/states";
import { OptionTypeBase } from "react-select/src/types";
import { usePermissionSets } from "reference-data/permission-sets";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { GetOrgUserLastLogin } from "../graphql/get-orguser-lastlogin.gen";
import { DatePicker } from "ui/components/form/date-picker";
import { Can } from "ui/components/auth/can";
import { ActionButtons } from "../../../components/action-buttons";

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
};

type Props = {
  editing: string | null;
  isCreate?: boolean;
  userId?: number | null | undefined;
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
    skip: props.isCreate,
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

  const permissionSets = usePermissionSets(orgUser.orgId!.toString(), [
    props.selectedRole,
  ]);
  const permissionSetOptions: OptionType[] = permissionSets.map(ps => ({
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

  const phoneRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

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
            permissionSet: data.permissionSetId && { id: data.permissionSetId },
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
                  action={{
                    text: t("Edit"),
                    visible: !props.editing,
                    execute: () => {
                      props.setEditing!(editableSections.information);
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
                              value={permissionSetOptions.find(
                                e =>
                                  e.value && e.value === values.permissionSetId
                              )}
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
                    {props.editing === editableSections.information && (
                      <PeopleGridItem
                        title={t("Date of Birth")}
                        description={
                          <DatePicker
                            variant={"single-hidden"}
                            startDate={values.dateOfBirth ?? ""}
                            onChange={e =>
                              setFieldValue("dateOfBirth", e.startDate)
                            }
                            startLabel={""}
                          />
                        }
                      />
                    )}
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
                    {props.editing !== editableSections.information && (
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
                        <Can do={[PermissionEnum.UserResetPassword]}>
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
}));
