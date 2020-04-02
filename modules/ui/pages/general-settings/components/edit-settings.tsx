import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Input } from "ui/components/form/input";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { SelectNew } from "ui/components/form/select-new";
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
      absenceSubContact: OrganizationContactInput;
      absenceEmployeeContact: OrganizationContactInput;
    };
  };
  onUpdateOrg: (updatedOrg: OrganizationUpdateInput) => Promise<any>;
};

export const EditGeneralSettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const [changeTimezoneIsOpen, setChangeTimezoneIsOpen] = React.useState(false);

  const timeZoneOptions = useTimeZoneOptions();
  const selectedTimeZoneOption = timeZoneOptions.find(
    tz => tz && tz.value === props.organization.timeZoneId?.toString()
  ) ?? { label: "", value: "" };

  return (
    <>
      <PageTitle title={t("General Settings")} />
      <Formik
        initialValues={{
          name: props.organization.name,
          timeZoneId: props.organization.timeZoneId,
          externalId: props.organization.externalId ?? "",
        }}
        onSubmit={async data => {
          await props.onUpdateOrg({
            orgId: props.organization.id,
            rowVersion: props.organization.rowVersion,
            name: data.name,
            externalId: data.externalId,
            timeZoneId: data.timeZoneId,
          });
        }}
        validationSchema={yup.object().shape({
          name: yup.string().required(t("Org name is required")),
          externalId: yup.string().nullable(),
          timeZoneId: yup.string().required(t("Time zone is required")),
        })}
      >
        {({ handleSubmit, submitForm, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <Grid container spacing={isMobile ? 2 : 8}>
                <Grid container item>
                  <Grid item xs={isMobile ? 12 : 4}>
                    <Input
                      label={t("Organization name")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "name",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={isMobile ? 12 : 4}>
                    <Input
                      label={t("External Id")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "externalId",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  {/* <Grid item xs={12}>
                    <div className={classes.labelContainer}>
                      <div>{t("Mobile Phone")}</div>
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "phone",
                        fullWidth: true,
                      }}
                    />
                  </Grid> */}
                  <Grid item xs={isMobile ? 12 : 4}>
                    <div>
                      <div className={classes.labelContainer}>
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
                        <TextButton
                          onClick={() => setChangeTimezoneIsOpen(true)}
                        >
                          {t("Edit time zone")}
                        </TextButton>
                      </div>
                      <SelectNew
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
              </Grid>
              <div className={classes.button}>
                {/* <Button onClick={submitForm} variant="contained">
                  {t("Cancel")}
                </Button> */}
                <Button onClick={submitForm} variant="contained">
                  {t("Save")}
                </Button>
              </div>
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  button: {
    display: "flex",
    marginTop: theme.spacing(2),
    justifyContent: "flex-end",
  },
  labelContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.4),
  },
  tooltip: {
    padding: theme.spacing(2),
  },
}));
