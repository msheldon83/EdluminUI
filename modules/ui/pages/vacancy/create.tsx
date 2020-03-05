import * as React from "react";
import { useState, useMemo } from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { UnderConstructionHeader } from "ui/components/under-construction";
import { VacancyCreateRoute } from "ui/routes/vacancy";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/graphql/position-types.gen";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { Formik } from "formik";
import { VacancyDetailSection } from "./components/vacancy-details-section";
import {
  PositionType,
  VacancyCreateInput,
  VacancyDetailInput,
  PermissionEnum,
} from "graphql/server-types.gen";
import { GetAllLocationsWithSchedulesWithinOrg } from "./graphql/get-locations-with-schedules.gen";
import { GetAllContracts } from "reference-data/get-contracts.gen";
import { VacancySubstituteDetailsSection } from "./components/vacancy-substitute-details-section";
import { ContentFooter } from "ui/components/content-footer";
import { Can } from "ui/components/auth/can";
import { OrgUserPermissions } from "ui/components/auth/types";
import { canAssignSub } from "helpers/permissions";
import { parseISO } from "date-fns";
import { GetAllPayCodesWithinOrg } from "ui/pages/pay-code/graphql/get-pay-codes.gen";
import { GetAccountingCodes } from "reference-data/get-accounting-codes.gen";

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
    details: [],
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

  const getPayCodes = useQueryBundle(GetAllPayCodesWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  const getContracts = useQueryBundle(GetAllContracts, {
    variables: { orgId: params.organizationId },
  });

  const getAccountingCodes = useQueryBundle(GetAccountingCodes, {
    variables: { orgId: params.organizationId },
  });

  if (
    getPositionTypes.state === "LOADING" ||
    getLocations.state === "LOADING" ||
    getContracts.state === "LOADING" ||
    getPayCodes.state === "LOADING" ||
    getAccountingCodes.state === "LOADING"
  ) {
    return <></>;
  }

  const positionTypes: any = compact(
    getPositionTypes?.data?.positionType?.all ?? []
  );

  const locations: any = compact(getLocations?.data?.location?.all ?? []);

  const contracts: any = compact(getContracts?.data?.contract?.all ?? []);

  const payCodes: any = compact(getPayCodes?.data?.orgRef_PayCode?.all ?? []);

  const accountingCodes: any = compact(
    getAccountingCodes?.data?.orgRef_AccountingCode?.all ?? []
  );

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
  console.log("MODEL", vacancyForCreate);
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
  console.log(payCodes);

  return (
    <>
      <PageTitle title={t("Create vacancy")} withoutHeading />
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
          details: [],
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
          dirty,
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
                  payCodes={payCodes}
                  accountingCodes={accountingCodes}
                  contracts={contracts}
                  setVacancyForCreate={setVacancyForCreate}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <VacancySubstituteDetailsSection
                  scheduleDays={values.details.map((d: VacancyDetailInput) => {
                    console.log("from create", d.accountingCodeAllocations);
                    console.log("acccodes", accountingCodes);
                    return {
                      date: d.date,
                      startTime: d.startTime,
                      endTime: d.endTime,
                      location: locations.find(
                        (l: any) => values.locationId === l.id
                      )?.name,
                      payCode: payCodes.find((p: any) => d.payCodeId === p.id)
                        ?.name,

                      accountingCode: !d.accountingCodeAllocations
                        ? undefined
                        : accountingCodes.find((a: any) =>
                            d.accountingCodeAllocations
                              ? a.id ===
                                d.accountingCodeAllocations[0]?.accountingCodeId
                              : false
                          )?.name,
                    };
                  })}
                />
              </Grid>
            </Grid>
            <ContentFooter>
              <Grid item xs={12} className={classes.contentFooter}>
                <div className={classes.actionButtons}>
                  <div className={classes.unsavedText}>
                    {dirty && (
                      <Typography>
                        {t("This page has unsaved changes")}
                      </Typography>
                    )}
                  </div>
                  <Can
                    do={(
                      permissions: OrgUserPermissions[],
                      isSysAdmin: boolean,
                      orgId?: string
                    ) =>
                      canAssignSub(
                        parseISO(new Date().toString()),
                        permissions,
                        isSysAdmin,
                        orgId
                      )
                    }
                  >
                    <Button
                      variant="outlined"
                      className={classes.preArrangeButton}
                      onClick={() => {}}
                      disabled={false}
                    >
                      {t("Pre-arrange")}
                    </Button>
                  </Can>
                  <Can do={[PermissionEnum.AbsVacSave]}>
                    <Button
                      form="absence-form"
                      type="submit"
                      variant="contained"
                      className={classes.saveButton}
                      disabled={!dirty}
                    >
                      {t("Create without assigning a substitute")}
                    </Button>
                  </Can>
                </div>
              </Grid>
            </ContentFooter>
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
  contentFooter: {
    height: theme.typography.pxToRem(72),
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  unsavedText: {
    marginRight: theme.typography.pxToRem(30),
    marginTop: theme.typography.pxToRem(8),
  },
  saveButton: {
    marginRight: theme.spacing(4),
  },
  preArrangeButton: {
    marginRight: theme.spacing(2),
  },
}));
