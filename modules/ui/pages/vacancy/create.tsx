import * as React from "react";
import { useState } from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { UnderConstructionHeader } from "ui/components/under-construction";
import { VacancyCreateRoute } from "ui/routes/vacancy";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/graphql/position-types.gen";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { Formik } from "formik";
import { VacancyDetailSection } from "./components/vacancy-details-section";
import { PositionType } from "graphql/server-types.gen";

type Props = {};

export const VacancyCreate: React.FC<Props> = props => {
  const params = useRouteParams(VacancyCreateRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const vacancyForTitle = useState("");

  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired: false },
  });

  if (getPositionTypes.state === "LOADING") {
    return <></>;
  }

  const positionTypes: any = compact(
    getPositionTypes?.data?.positionType?.all ?? []
  );

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
      <Typography variant="h4">Teacher,Bettersea Junior High</Typography>

      <Formik
        initialValues={{ positionTypeId: "", locationId: "" }}
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
            <VacancyDetailSection
              orgId={params.organizationId}
              values={values}
              positionTypes={positionTypes}
            ></VacancyDetailSection>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: { color: theme.customColors.primary },
}));
