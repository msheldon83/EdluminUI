import * as React from "react";
import { useState, useMemo } from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { UnderConstructionHeader } from "ui/components/under-construction";
import { VacancyCreateRoute } from "ui/routes/vacancy";
import { useTranslation } from "react-i18next";
import { Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/graphql/position-types.gen";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { Formik } from "formik";
import { VacancyDetailSection } from "./components/vacancy-details-section";
import { PositionType, VacancyCreateInput } from "graphql/server-types.gen";
import { GetAllLocationsWithSchedulesWithinOrg } from "./graphql/get-locations-with-schedules.gen";
import { GetAllContracts } from "reference-data/get-contracts.gen";

type Props = {};

export const VacancyCreate: React.FC<Props> = props => {
  const params = useRouteParams(VacancyCreateRoute);
  const { t } = useTranslation();
  const classes = useStyles();

  const defaultVacancyCreateInput: VacancyCreateInput = {
    orgId: params.organizationId,
    positionTypeId: "",
    contractId: "",
    locationId: "",
    workDayScheduleId: "",
  };

  const [vacancyForCreate, setVacancyForCreate] = useState<VacancyCreateInput>(
    defaultVacancyCreateInput
  );

  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired: false },
  });

  const getLocations = useQueryBundle(GetAllLocationsWithSchedulesWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  const getContracts = useQueryBundle(GetAllContracts, {
    variables: { orgId: params.organizationId },
  });

  if (
    getPositionTypes.state === "LOADING" ||
    getLocations.state === "LOADING" ||
    getContracts.state === "LOADING"
  ) {
    return <></>;
  }

  const positionTypes: any = compact(
    getPositionTypes?.data?.positionType?.all ?? []
  );

  const locations: any = compact(getLocations?.data?.location?.all ?? []);

  const contracts: any = compact(getContracts?.data?.contract?.all ?? []);

  const subHeader = () => {
    let label =
      vacancyForCreate.positionTypeId !== ""
        ? positionTypes.find(
            (pt: any) => pt.id === vacancyForCreate.positionTypeId
          ).name
        : "";

    label =
      vacancyForCreate.locationId !== "" && locations.length !== 0
        ? `${label}, ${locations.find(
            (l: any) => l.id === vacancyForCreate.locationId
          ).name ?? ""}`
        : label;
    return label;
  };

  //console.log("positionTypes", positionTypes);
  //console.log("locations", locations);
  //console.log("contracts", contracts);
  /*** TODO : Make sure to switch this before comitting */
  if (!__DEV__) {
    return (
      <>
        <PageTitle title={`${t("Create vacancy")}`} />
        <UnderConstructionHeader />
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("Create vacacny")} withoutHeading />
      <Typography className={classes.title} variant="h5">
        {t("Create vacancy")}
      </Typography>
      <Typography className={classes.subHeader} variant="h4">
        {subHeader()}
      </Typography>

      <Formik
        initialValues={{
          positionTypeId: "",
          locationId: "",
          contractId: "",
          workDayScheduleId: "",
        }}
        onSubmit={async (data, e) => {}}
      >
        {({
          values,
          handleSubmit,
          submitForm,
          setFieldValue,
          handleBlur,
          errors,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid
              container
              justify="space-between"
              className={classes.container}
            >
              <Grid item xs={12} sm={6} className={classes.vacDetailColumn}>
                <VacancyDetailSection
                  orgId={params.organizationId}
                  values={values}
                  setFieldValue={setFieldValue}
                  positionTypes={positionTypes}
                  locations={locations}
                  contracts={contracts}
                  setVacancyForCreate={setVacancyForCreate}
                ></VacancyDetailSection>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant="h6">{t("Substitute Details")}</Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: { color: theme.customColors.primary },
  container: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderTopWidth: 0,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      5
    )} ${theme.typography.pxToRem(5)}`,
    padding: theme.spacing(3),
  },
  subHeader: {
    height: theme.typography.pxToRem(60),
  },
  vacDetailColumn: {
    marginRight: theme.typography.pxToRem(20),
  },
}));
