import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetVacancyDetails } from "./graphql/get-vacancydetails.gen";
import { useRouteParams } from "ui/routes/definition";
import { useQueryParamIso } from "hooks/query-params";
import { useSnackbar } from "hooks/use-snackbar";
import { useTranslation } from "react-i18next";
import { Button, Divider, Typography } from "@material-ui/core";
import { VerifyDailyRoute } from "ui/routes/absence-vacancy/verify";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { format } from "date-fns";
import { compact } from "lodash-es";
import { DailyFilters as Filters } from "./components/filters/daily";
import { FilterQueryParams } from "./components/filters/filter-params";
import { VacancyDetailVerifyInput } from "graphql/server-types.gen";
import { VerifyVacancyDetail } from "./graphql/verify-vacancy-detail.gen";
import { VerifyDailyUI } from "./daily-ui";
import { AssignmentDetail } from "./types";

export const VerifyDailyPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(VerifyDailyRoute);
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);
  const { openSnackbar } = useSnackbar();
  const [verifiedId, setVerifiedId] = React.useState<string | null | undefined>(
    null
  );
  const getVacancyDetails = useQueryBundle(GetVacancyDetails, {
    variables: {
      orgId: params.organizationId,
      includeVerified: true,
      locationIds: filters.locationIds,
      fromDate: filters.date,
      toDate: filters.date,
      //shadowFromOrgId: filters.subSource,
    },
  });

  const fullName = ({
    firstName,
    lastName,
  }: {
    firstName: string;
    lastName: string;
  }) => `${firstName} ${lastName}`;

  const assignments: "LOADING" | AssignmentDetail[] =
    getVacancyDetails.state === "LOADING"
      ? "LOADING"
      : ((getVacancyDetails.data?.vacancy?.getAssignmentsForVerify ??
          []) as AssignmentDetail[]);
  const [verifyVacancyDetail] = useMutationBundle(VerifyVacancyDetail);

  const onVerify = async (verifyInput: VacancyDetailVerifyInput) => {
    await verifyVacancyDetail({
      variables: {
        vacancyDetail: verifyInput,
      },
    });
    if (verifyInput.doVerify) {
      setVerifiedId(verifyInput.vacancyDetailId);
      openSnackbar({
        dismissable: true,
        autoHideDuration: 5000,
        status: "info",
        message: (
          <div>
            {t("Assignment has been verified.")}
            <Button
              variant="contained"
              onClick={() =>
                onVerify({
                  vacancyDetailId: verifyInput.vacancyDetailId,
                  doVerify: false,
                })
              }
            >
              {t("Undo verify")}
            </Button>
          </div>
        ),
      });
    }
    if (verifyInput.doVerify !== null) {
      await getVacancyDetails.refetch();
      setVerifiedId(null);
    }
  };

  return (
    <>
      <Typography variant="h5">{t("Verify substitute assignments")}</Typography>
      <PageTitle title={format(new Date(filters.date), "EEE, MMM d")} />
      <Section>
        <Filters
          orgId={params.organizationId}
          filters={filters}
          setFilters={updateFilters}
        />
        <Divider />
        {assignments == "LOADING" ? (
          <Typography>{t("Loading...")}</Typography>
        ) : (
          <VerifyDailyUI
            orgId={params.organizationId}
            assignments={assignments}
            showVerified={filters.showVerified}
            onVerify={onVerify}
          />
        )}
      </Section>
    </>
  );
};
