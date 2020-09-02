import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Input } from "ui/components/form/input";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { Select } from "ui/components/form/select";
import { useTimeZoneOptions } from "reference-data/timezones";
import InfoIcon from "@material-ui/icons/Info";
import { Section } from "ui/components/section";
import { Formik } from "formik";
import { Button, Grid, Tooltip } from "@material-ui/core";
import * as yup from "yup";
import { PageTitle } from "ui/components/page-title";
import {
  OrganizationUpdateInput,
  TimeZone,
  OrganizationContactInput,
} from "graphql/server-types.gen";

type Props = {
  organization: {
    id: string;
    rowVersion: string;
    name: string;
    timeZoneId?: TimeZone | null;
    externalId?: string | null;
    config?: {
      absenceSubContact?: OrganizationContactInput;
      absenceEmployeeContact?: OrganizationContactInput;
    };
  };
  onUpdateOrg: (updatedOrg: OrganizationUpdateInput) => Promise<any>;
  onCancel: () => Promise<void>;
};

export const EditGeneralSettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const [changeTimezoneIsOpen, setChangeTimezoneIsOpen] = React.useState(false);

  const timeZoneOptions = useTimeZoneOptions();
  const selectedTimeZoneOption = timeZoneOptions.find(
    tz => tz && tz.value === props.organization.timeZoneId?.toString()
  ) ?? {
    label: "",
    value: "",
  };

  return (
    <>
      <PageTitle title={t("General Settings")} />
      <Formik
        initialValues={{
          name: props.organization.name,
          timeZoneId: props.organization.timeZoneId,
          externalId: props.organization.externalId ?? "",
          absenceSubContactName:
            props.organization.config?.absenceSubContact?.name ?? "",
          absenceSubContactPhone:
            props.organization.config?.absenceSubContact?.phone ?? "",
          absenceSubContactEmail:
            props.organization.config?.absenceSubContact?.email ?? "",
          absenceEmployeeContactName:
            props.organization.config?.absenceEmployeeContact?.name ?? "",
          absenceEmployeeContactPhone:
            props.organization.config?.absenceEmployeeContact?.phone ?? "",
          absenceEmployeeContactEmail:
            props.organization.config?.absenceEmployeeContact?.email ?? "",
        }}
        onSubmit={async data => {
          await props.onUpdateOrg({
            orgId: props.organization.id,
            rowVersion: props.organization.rowVersion,
            name: data.name,
            externalId: data.externalId,
            timeZoneId: data.timeZoneId,
            config: {
              absenceSubContact: {
                name: data.absenceSubContactName,
                phone: data.absenceSubContactPhone,
                email: data.absenceSubContactEmail,
              },
              absenceEmployeeContact: {
                name: data.absenceEmployeeContactName,
                phone: data.absenceEmployeeContactPhone,
                email: data.absenceEmployeeContactEmail,
              },
            },
          });
        }}
        validationSchema={yup.object().shape({
          name: yup.string().required(t("District name is required")),
          externalId: yup.string().nullable(),
          timeZoneId: yup.string().required(t("Time zone is required")),
          absenceSubContactEmail: yup.string().email("Must be a valid email"),
          absenceEmployeeContactEmail: yup
            .string()
            .email("Must be a valid email"),
        })}
      >
        {({ handleSubmit, submitForm, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <Grid container spacing={2} className={classes.paddingBottom}>
                <Grid item xs={isMobile ? 12 : 4}>
                  <Input
                    label={t("District Name")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "name",
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <Input
                    label={t("Identifier")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "externalId",
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <div>
                    <div className={classes.timezoneLabelContainer}>
                      <div>
                        {t("Time Zone")}
                        <Tooltip
                          title={
                            <div className={classes.tooltip}>
                              {t(
                                "Changing the timezone will cause your availability times to change."
                              )}
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
                      </div>
                      <TextButton onClick={() => setChangeTimezoneIsOpen(true)}>
                        {t("Edit time zone")}
                      </TextButton>
                    </div>
                    <Select
                      value={selectedTimeZoneOption}
                      multiple={false}
                      options={timeZoneOptions}
                      disabled={!changeTimezoneIsOpen}
                      withResetValue={false}
                      onChange={value => {
                        const timeZoneId = value.value;
                        setFieldValue("timeZoneId", timeZoneId);
                      }}
                    />
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SectionHeader title={t("District Contacts")} />
                  <Section className={classes.sectionBackground}>
                    <div>
                      Enter a district-level contact for substitutes and
                      employees below. This contact information will be visible
                      from the Help menu in Red Rover for substitutes and
                      employees. You can use the same contact for both
                      substitutes and employees, or you can have a separate
                      contact for each.
                    </div>
                    <div className={classes.noteText}>
                      Note: Substitutes and Employees will see separate contacts
                      for each of their districts who use Red Rover districts.
                    </div>
                  </Section>
                </Grid>
                <Grid item xs={4}>
                  <Grid item xs={12} className={classes.gridMargin}>
                    <div className={classes.labelContainer}>
                      <div>{t("District Contact Name for Substitutes")}</div>
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "absenceSubContactName",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridMargin}>
                    <div className={classes.labelContainer}>
                      <div>{t("District Contact Phone for Substitutes")}</div>
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "absenceSubContactPhone",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridMargin}>
                    <div className={classes.labelContainer}>
                      <div>{t("District Contact Email for Substitutes")}</div>
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "absenceSubContactEmail",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <Grid item xs={12} className={classes.gridMargin}>
                    <div className={classes.labelContainer}>
                      <div>{t("District Contact Name for Employees")}</div>
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "absenceEmployeeContactName",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridMargin}>
                    <div className={classes.labelContainer}>
                      <div>{t("District Contact Phone for Employees")}</div>
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "absenceEmployeeContactPhone",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.gridMargin}>
                    <div className={classes.labelContainer}>
                      <div>{t("District Contact Email for Employees")}</div>
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "absenceEmployeeContactEmail",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <div className={classes.buttonContainer}>
                <div className={classes.button}>
                  <Button onClick={props.onCancel} variant="contained">
                    {t("Cancel")}
                  </Button>
                </div>
                <div className={classes.button}>
                  <Button onClick={submitForm} variant="contained">
                    {t("Save")}
                  </Button>
                </div>
              </div>
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  buttonContainer: {
    display: "flex",
    marginTop: theme.spacing(2),
    justifyContent: "flex-end",
  },
  button: {
    paddingLeft: "10px",
  },
  labelContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.4),
  },
  timezoneLabelContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  paddingBottom: {
    paddingBottom: "20px",
  },
  noteText: {
    paddingTop: "10px",
    fontStyle: "italic",
  },
  sectionBackground: {
    backgroundColor: theme.customColors.lightSlate,
  },
  gridMargin: {
    marginTop: "20px",
  },
}));
