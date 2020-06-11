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
import { AssignmentRow } from "./types";

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
      includeVerified: filters.showVerified,
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

  const assignments: "LOADING" | AssignmentRow[] =
    getVacancyDetails.state == "LOADING"
      ? "LOADING"
      : compact(
          getVacancyDetails.data?.vacancy?.getAssignmentsForVerify ?? []
        ).map(d => ({
          id: d.assignment!.id,
          subName: fullName(d.assignment!.employee!),
          subFor: d.vacancy!.absence
            ? fullName(d.vacancy!.absence.employee!)
            : d.vacancy!.position!.title,
          reason: d.vacancy!.absence?.details
            ? d.vacancy!.absence?.details[0]!.id
            : d.vacancyReason!.name,
          startTime: d.startTimeLocal,
          endTime: d.endTimeLocal,
          payDuration: d.payInfo?.dayConversion?.name ?? undefined,
          position: d.vacancy!.position!.title,
          payCode: d.payCode ?? undefined,
          school: d.location!.name,
          accountingCode:
            d.accountingCodeAllocations[0]?.accountingCode ?? undefined,
          adminComments: "",
          isVerified: d.verifiedAtLocal ? true : false,
          ...(d.vacancy!.absence?.id
            ? {
                absenceId: d.vacancy!.absence.id,
                notesToAdmin: d.vacancy?.absence.adminOnlyNotes ?? "",
              }
            : { vacancyId: d.vacancyId }),
        }));
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
            assignments={assignments}
            showVerified={filters.showVerified}
            onVerify={onVerify}
          />
        )}
      </Section>
    </>
  );
};
