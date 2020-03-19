import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { ShowErrors } from "ui/components/error-helpers";
import { useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { useMemo } from "react";
import { useTimezones } from "reference-data/timezones";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import {
  OrganizationCreateInput,
  OrganizationType,
  SeedOrgDataOptionEnum,
  CountryCode,
  TimeZone,
  FeatureFlag,
} from "graphql/server-types.gen";
import { AdminRootChromeRoute } from "ui/routes/app-chrome";
import { CreateOrganization } from "./graphql/create-organization.gen";
import { Typography, makeStyles } from "@material-ui/core";
import { AddBasicInfo } from "./components/add-info";

export const OrganizationAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(AdminRootChromeRoute);
  const [name, setName] = React.useState<string | null>(null);
  const { openSnackbar } = useSnackbar();
  const timeZones = useTimezones();
  const namePlaceholder = t("Glenbrook");

  //Add Edustaff boolean. Add to backend as well to check and delegate additional 2 Action Handlers if true.
  const [organization, setOrganization] = React.useState<
    OrganizationCreateInput
  >({
    name: "",
    externalId: null,
    superUserFirstName: "",
    superUserLastName: "",
    superUserLoginEmail: "",
    timeZoneId: TimeZone.EasternStandardTimeUsCanada,
    seedOrgDataOption: SeedOrgDataOptionEnum.SeedAsynchronously,
    isEdustaffOrg: false,
    config: {
      organizationTypeId: OrganizationType.Implementing,
      orgUsersMustAcceptEula: false,
      featureFlags: [
        FeatureFlag.FullDayAbsences,
        FeatureFlag.HalfDayAbsences,
        FeatureFlag.HourlyAbsences,
      ],
      defaultCountry: CountryCode.Us,
      longTermVacancyThresholdDays: 0,
      minLeadTimeMinutesToCancelVacancy: 0,
      minutesBeforeStartAbsenceCanBeCreated: 0,
      minLeadTimeMinutesToCancelVacancyWithoutPunishment: 0,
      maxGapMinutesForSameVacancyDetail: 0,
      minAbsenceMinutes: 0,
      maxAbsenceDays: 0,
      absenceCreateCutoffTime: 0,
      requestedSubCutoffMinutes: 0,
      minRequestedEmployeeHoldMinutes: 0,
      maxRequestedEmployeeHoldMinutes: 0,
      minorConflictThresholdMinutes: 0,
      minutesRelativeToStartVacancyCanBeFilled: 0,
      //vacancyDayConversions: [{ name: "", maxMinutes: 0, dayEquivalent: 0 }], // TODO: Add to Formik
    },
  });

  //Mutation
  const [createOrganization] = useMutationBundle(CreateOrganization, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const create = async (organization: OrganizationCreateInput) => {
    const result = await createOrganization({
      variables: {
        organization: {
          ...organization,
          externalId:
            organization.externalId &&
            organization.externalId.trim().length === 0
              ? null
              : organization.externalId,
        },
      },
    });

    return result?.data?.organization?.create?.id;
  };

  const seedOrgDataOptions = useMemo(() => {
    return [
      {
        value: SeedOrgDataOptionEnum.DontSeed,
        label: t("Don't Seed"),
      },
      {
        value: SeedOrgDataOptionEnum.SeedAsynchronously,
        label: t("Asynchronously"),
      },
      {
        value: SeedOrgDataOptionEnum.SeedSynchronously,
        label: t("Synchronously"),
      },
    ];
  }, [t]);

  const orgTypes = useMemo(() => {
    return [
      {
        value: OrganizationType.Invalid,
        label: t("Invalid"),
      },
      {
        value: OrganizationType.Demo,
        label: t("Demo"),
      },
      {
        value: OrganizationType.Implementing,
        label: t("Implementing"),
      },
      {
        value: OrganizationType.Standard,
        label: t("Standard"),
      },
    ];
  }, [t]);

  const featureFlagOptions = useMemo(() => {
    return [
      {
        value: FeatureFlag.None,
        label: t("None"),
      },
      {
        value: FeatureFlag.HourlyAbsences,
        label: t("Hourly"),
      },
      {
        value: FeatureFlag.QuarterDayAbsences,
        label: t("Quarterly"),
      },
      {
        value: FeatureFlag.HalfDayAbsences,
        label: t("Half Day"),
      },
      {
        value: FeatureFlag.FullDayAbsences,
        label: t("Full Day"),
      },
    ];
  }, [t]);

  const timeZoneOptions = timeZones.map(c => {
    return { label: c!.name, value: c!.enumValue ?? "" };
  });

  return (
    <div className={classes.header}>
      <PageTitle title={t("Create New Organization")} />
      <div className={classes.paddingBottom}>
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>
      <AddBasicInfo
        namePlaceholder={namePlaceholder}
        organization={organization}
        seedOrgDataOptions={seedOrgDataOptions}
        organizationTypes={orgTypes}
        timeZoneOptions={timeZoneOptions}
        featureFlagOptions={featureFlagOptions}
        onSubmit={async (
          name: string,
          superUserFirstName: string,
          superUserLastName: string,
          superUserLoginEmail: string,
          seedOrgDataOption: SeedOrgDataOptionEnum,
          featureFlags: FeatureFlag[],
          organizationTypeId: OrganizationType,
          timeZoneId: TimeZone,
          isEdustaffOrg: boolean,
          orgUsersMustAcceptEula: boolean,
          externalId?: string | null,
          longTermVacancyThresholdDays?: number | null,
          minLeadTimeMinutesToCancelVacancy?: number | null,
          minutesBeforeStartAbsenceCanBeCreated?: number | null,
          minLeadTimeMinutesToCancelVacancyWithoutPunishment?: number | null,
          maxGapMinutesForSameVacancyDetail?: number | null,
          minAbsenceMinutes?: number | null,
          maxAbsenceDays?: number | null,
          absenceCreateCutoffTime?: number | null,
          requestedSubCutoffMinutes?: number | null,
          minRequestedEmployeeHoldMinutes?: number | null,
          maxRequestedEmployeeHoldMinutes?: number | null,
          minorConflictThresholdMinutes?: number | null,
          minutesRelativeToStartVacancyCanBeFilled?: number | null
        ) => {
          const newOrganization = {
            ...organization,
            name: name,
            superUserFirstName: superUserFirstName,
            superUserLastName: superUserLastName,
            superUserLoginEmail: superUserLoginEmail,
            seedOrgDataOption: seedOrgDataOption,
            isEdustaffOrg: isEdustaffOrg,
            timeZoneId: timeZoneId,
            externalId: externalId,
            config: {
              organizationTypeId: organizationTypeId,
              longTermVacancyThresholdDays: longTermVacancyThresholdDays,
              featureFlags: featureFlags,
              minLeadTimeMinutesToCancelVacancy: minLeadTimeMinutesToCancelVacancy,
              orgUsersMustAcceptEula: orgUsersMustAcceptEula,
              minutesBeforeStartAbsenceCanBeCreated: minutesBeforeStartAbsenceCanBeCreated,
              minLeadTimeMinutesToCancelVacancyWithoutPunishment: minLeadTimeMinutesToCancelVacancyWithoutPunishment,
              maxGapMinutesForSameVacancyDetail: maxGapMinutesForSameVacancyDetail,
              minAbsenceMinutes: minAbsenceMinutes,
              maxAbsenceDays: maxAbsenceDays,
              absenceCreateCutoffTime: absenceCreateCutoffTime,
              requestedSubCutoffMinutes: requestedSubCutoffMinutes,
              minRequestedEmployeeHoldMinutes: minRequestedEmployeeHoldMinutes,
              maxRequestedEmployeeHoldMinutes: maxRequestedEmployeeHoldMinutes,
              minorConflictThresholdMinutes: minorConflictThresholdMinutes,
              minutesRelativeToStartVacancyCanBeFilled: minutesRelativeToStartVacancyCanBeFilled,
            },
          };

          console.log(newOrganization);

          //TODO
          setOrganization(newOrganization);

          const result = await create(organization);

          // const url = AdminRootChromeRoute.generate(params);
          // history.push(url);
        }}
        onCancel={() => {
          const url = AdminRootChromeRoute.generate(params);
          history.push(url);
        }}
        onNameChange={name => setName(name)}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  fakeStyle: {
    margin: "2px",
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
  paddingBottom: {
    paddingBottom: theme.spacing(1),
  },
}));
