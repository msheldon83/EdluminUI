import * as React from "react";
import { Typography, Divider, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { formatIsoDateIfPossible } from "helpers/date";
import { TextButton } from "ui/components/text-button";
import { AvatarCard } from "ui/components/avatar-card";
import { useBreakpoint } from "hooks";
import { getInitials } from "ui/components/helpers";
import { PhoneNumberInput } from "ui/components/form/phone-number-input";
import { StateCode, CountryCode, OrgUserRole } from "graphql/server-types.gen";
import { PeopleGridItem } from "./people-grid-item";
import * as yup from "yup";
import { Formik } from "formik";
import { Input } from "ui/components/form/input";
import { Select, SelectValueType, OptionType } from "ui/components/form/select";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { USStates } from "reference-data/states";
import { OptionTypeBase } from "react-select/src/types";
import {
  DateInput
} from "ui/components/form/date-picker";

const editableSections = {
  information: "edit-information",
};

type Props = {
  editing: string | null;
  orgUser: {
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
    loginEmail?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    permissionSets?:
      | Array<{ name: string; orgUserRole: OrgUserRole } | null | undefined>
      | null
      | undefined;
    isSuperUser: boolean;
  };
  lastLogin: string | null | undefined;
  selectedRole: OrgUserRole;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  onResetPassword: () => Promise<unknown>;
};

export const Information: React.FC<Props> = props => {
  const classes = useStyles();

  const orgUser = props.orgUser;
  const { t } = useTranslation();
  const history = useHistory();
  const isSmDown = useBreakpoint("sm", "down");

  const formattedLoginTime = formatIsoDateIfPossible(
    props.lastLogin ? props.lastLogin : null,
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

  let permissions = orgUser.isSuperUser ? t("Org Admin") : "";
  if (orgUser.permissionSets!.length > 0) {
    permissions =
      orgUser?.permissionSets
        ?.filter(p => p?.orgUserRole === props.selectedRole)
        .map(p => p?.name)
        .join(",") ?? t("No Permissions Defined");
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
          dateOfBirth: orgUser.dateOfBirth ?? undefined,
        }}
        onSubmit={async (data, e) => {}}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section className={classes.customSection}>
              <SectionHeader
                title={t("Information")}
                action={
                  props.editing === editableSections.information
                    ? {
                        text: t("Save"),
                        visible: true,
                        execute: () => {
                          props.setEditing(editableSections.information);
                        },
                      }
                    : {
                        text: t("Edit"),
                        visible: !props.editing,
                        execute: () => {
                          props.setEditing(editableSections.information);
                        },
                      }
                }
              />
              <Grid container>
                <Grid container item xs={8} component="dl" spacing={2}>
                  <PeopleGridItem
                    title={t("Email")}
                    description={
                      props.editing === editableSections.information ? (
                        <Input
                          value={values.email}
                          InputComponent={FormTextField}
                          inputComponentProps={{
                            name: "email",
                          }}
                        />
                      ) : (
                        orgUser.email
                      )
                    }
                  />
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
                                    selectedValue = (e as OptionTypeBase).value;
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
                          <div>{orgUser.address2 && `${orgUser.address2}`}</div>
                          <div>{`${orgUser.city}, ${orgUser.state} ${orgUser.postalCode}`}</div>
                          <div>{orgUser.country}</div>
                        </>
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
                  <PeopleGridItem
                    title={t("Date of Birth")}
                    description={
                      props.editing === editableSections.information ? (
                        <DateInput 
                          value={values.dateOfBirth}
                          label={""}
                          onChange={(e) => setFieldValue("dateOfBirth", e)}
                          onValidDate={(e) => setFieldValue("dateOfBirth", e)}
                        /> 
                      ) : (formattedBirthDate)}
                  />
                  <Grid item xs={12}>
                    <Divider variant="fullWidth" className={classes.divider} />
                  </Grid>
                  <PeopleGridItem
                    title={t("Username")}
                    description={orgUser.loginEmail}
                  />
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
                  <PeopleGridItem
                    title={t("Password")}
                    description={
                      <TextButton onClick={() => props.onResetPassword()}>
                        {t("Reset Password")}
                      </TextButton>
                    }
                  />
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
}));
