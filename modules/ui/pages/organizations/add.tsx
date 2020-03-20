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

  //Current Staffing Partner OrgId
  const eduStaffOrgId = Config.isDevFeatureOnly ? "1046" : "1003";

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
    relatesToOrganizationId: "0",
    config: {
      organizationTypeId: OrganizationType.Implementing,
      orgUsersMustAcceptEula: false,
      featureFlags: [
        FeatureFlag.FullDayAbsences,
        FeatureFlag.HalfDayAbsences,
        FeatureFlag.HourlyAbsences,
      ],
      defaultCountry: CountryCode.Us,
      longTermVacancyThresholdDays: null,
      minLeadTimeMinutesToCancelVacancy: null,
      minutesBeforeStartAbsenceCanBeCreated: null,
      minLeadTimeMinutesToCancelVacancyWithoutPunishment: null,
      maxGapMinutesForSameVacancyDetail: null,
      minAbsenceMinutes: null,
      maxAbsenceDays: null,
      absenceCreateCutoffTime: null,
      requestedSubCutoffMinutes: null,
      minRequestedEmployeeHoldMinutes: null,
      maxRequestedEmployeeHoldMinutes: null,
      minorConflictThresholdMinutes: null,
      minutesRelativeToStartVacancyCanBeFilled: null,
      vacancyDayConversions: [{ name: "", maxMinutes: 0, dayEquivalent: 0 }],
    },
  });

  //Mutation
  const [createOrganization] = useMutationBundle(CreateOrganization, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const create = async (newOrganization: OrganizationCreateInput) => {
    const result = await createOrganization({
      variables: {
        organization: {
          ...newOrganization,
          name: newOrganization.name,
          externalId:
            newOrganization.externalId &&
            newOrganization.externalId.trim().length === 0
              ? null
              : newOrganization.externalId,
          superUserFirstName: newOrganization.superUserFirstName.trim(),
          superUserLastName: newOrganization.superUserLastName.trim(),
          superUserLoginEmail: newOrganization.superUserLoginEmail,
          timeZoneId: newOrganization.timeZoneId,
          seedOrgDataOption: newOrganization.seedOrgDataOption,
          relatesToOrganizationId: newOrganization.relatesToOrganizationId,
          config: {
            organizationTypeId: newOrganization.config?.organizationTypeId,
            orgUsersMustAcceptEula:
              newOrganization.config?.orgUsersMustAcceptEula,
            featureFlags: newOrganization.config?.featureFlags,
            defaultCountry: newOrganization.config?.defaultCountry,
            longTermVacancyThresholdDays:
              newOrganization.config?.longTermVacancyThresholdDays,
            minLeadTimeMinutesToCancelVacancy:
              newOrganization.config?.minLeadTimeMinutesToCancelVacancy,
            minutesBeforeStartAbsenceCanBeCreated:
              newOrganization.config?.minutesBeforeStartAbsenceCanBeCreated,
            minLeadTimeMinutesToCancelVacancyWithoutPunishment:
              newOrganization.config
                ?.minLeadTimeMinutesToCancelVacancyWithoutPunishment,
            maxGapMinutesForSameVacancyDetail:
              newOrganization.config?.maxGapMinutesForSameVacancyDetail,
            minAbsenceMinutes: newOrganization.config?.minAbsenceMinutes,
            maxAbsenceDays: newOrganization.config?.maxAbsenceDays,
            absenceCreateCutoffTime:
              newOrganization.config?.absenceCreateCutoffTime,
            requestedSubCutoffMinutes:
              newOrganization.config?.requestedSubCutoffMinutes,
            minRequestedEmployeeHoldMinutes:
              newOrganization.config?.minRequestedEmployeeHoldMinutes,
            maxRequestedEmployeeHoldMinutes:
              newOrganization.config?.maxRequestedEmployeeHoldMinutes,
            minorConflictThresholdMinutes:
              newOrganization.config?.minorConflictThresholdMinutes,
            minutesRelativeToStartVacancyCanBeFilled:
              newOrganization.config?.minutesRelativeToStartVacancyCanBeFilled,
          },
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
          const newOrganization: OrganizationCreateInput = {
            ...organization,
            name: name,
            superUserFirstName: superUserFirstName,
            superUserLastName: superUserLastName,
            superUserLoginEmail: superUserLoginEmail,
            seedOrgDataOption: seedOrgDataOption,
            relatesToOrganizationId: isEdustaffOrg ? eduStaffOrgId : "0",
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

          setOrganization(newOrganization);
          const result = await create(newOrganization);
          if (result) {
            const url = AdminRootChromeRoute.generate(params);
            history.push(url);
          }
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
