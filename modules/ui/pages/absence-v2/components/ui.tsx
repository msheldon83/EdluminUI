import * as React from "react";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import {
  NeedsReplacement,
  PermissionEnum,
  AbsenceUpdateInput,
  AbsenceCreateInput,
  DayPart,
  AbsenceDetailCreateInput,
  Absence,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { AbsenceState, absenceReducer } from "../state";
import { PageTitle } from "ui/components/page-title";
import * as yup from "yup";
import { StepParams } from "helpers/step-params";
import { useQueryParamIso } from "hooks/query-params";
import { AbsenceFormData, AbsenceDetail } from "../types";
import { Formik } from "formik";
import { validateAccountingCodeAllocations } from "helpers/accounting-code-allocations";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { Section } from "ui/components/section";
import { makeStyles, Grid, Typography, Button } from "@material-ui/core";
import { AbsenceDetails } from "./absence-details";
import {
  startOfMonth,
  isSameDay,
  format,
  isBefore,
  startOfDay,
  min,
} from "date-fns";
import { SubstituteDetails } from "./substitute-details";
import { ContentFooter } from "ui/components/content-footer";
import { Can, useCanDo } from "ui/components/auth/can";
import {
  getAbsenceDates,
  getCannotCreateAbsenceDates,
} from "ui/components/absence/helpers";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { some, sortBy } from "lodash-es";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canEditAbsVac } from "helpers/permissions";
import { ErrorBanner } from "ui/components/error-banner";

type Props = {
  organizationId: string;
  actingAsEmployee: boolean;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    locationIds: string[];
  };
  position?: {
    id: string;
    needsReplacement: NeedsReplacement;
    title: string;
    positionTypeId?: string;
    defaultPayCodeId?: string;
    defaultAccountingCodeAllocations: AccountingCodeValue;
  };
  initialAbsenceData: AbsenceFormData;
  saveAbsence: (
    data: AbsenceCreateInput | AbsenceUpdateInput,
    onError: Function
  ) => Promise<Absence>;
  deleteAbsence?: () => void;
};

export const AbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const canDoFn = useCanDo();
  const [step, setStep] = useQueryParamIso(StepParams);
  const {
    actingAsEmployee,
    organizationId,
    employee,
    position,
    initialAbsenceData,
    saveAbsence,
    deleteAbsence,
  } = props;

  const initialState = (props: Props): AbsenceState => {
    const absenceDates = initialAbsenceData.details.map(d => d.date);
    const viewingCalendarMonth =
      absenceDates.length > 0
        ? startOfMonth(absenceDates[0])
        : startOfMonth(new Date());
    return {
      employeeId: employee.id,
      organizationId: organizationId,
      positionId: position?.id ?? "0",
      viewingCalendarMonth,
      absenceDates,
      closedDates: [],
    };
  };
  const [state, dispatch] = React.useReducer(
    absenceReducer,
    props,
    initialState
  );

  const isCreate = !state.absenceId;
  const absenceReasons = useAbsenceReasons(
    organizationId,
    position?.positionTypeId
  );
  // const initialFormValues: AbsenceFormData = {
  //   id: state.absenceId,
  //   details: state.absenceDetails,
  //   needsReplacement: state.needsReplacement,
  //   accountingCodeAllocations: noAllocation(),
  // };

  const disabledDatesObjs = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );
  const disabledDates = React.useMemo(
    () => getCannotCreateAbsenceDates(disabledDatesObjs),
    [disabledDatesObjs]
  );

  React.useEffect(() => {
    const conflictingDates = disabledDates.filter(dis =>
      some(state.absenceDates, ad => isSameDay(ad, dis))
    );
    if (conflictingDates.length > 0) {
      dispatch({ action: "removeAbsenceDates", dates: conflictingDates });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledDates]);

  const canSaveAbsence = React.useCallback(
    (absenceDetails: AbsenceDetail[]) => {
      if (isCreate) {
        return true;
      }

      const absenceDates = absenceDetails.map(ad => ad.date);
      return canDoFn(
        (
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string,
          forRole?: Role | null | undefined
        ) =>
          canEditAbsVac(
            startOfDay(min(absenceDates)),
            permissions,
            isSysAdmin,
            orgId,
            actingAsEmployee ? "employee" : "admin"
            //props.approvalStatus
          )
      );
    },
    [actingAsEmployee, canDoFn, isCreate]
  );

  return (
    <>
      <PageTitle
        title={isCreate ? t("Create absence") : t("Edit absence")}
        withoutHeading
      />
      {step === "absence" && (
        <Formik
          initialValues={initialAbsenceData}
          validationSchema={yup.object().shape({
            details: yup.array().of(
              yup.object().shape({
                absenceReasonId: yup
                  .string()
                  .nullable()
                  .required(t("Required")),
                dayPart: yup
                  .string()
                  .nullable()
                  .required(t("Required")),
                hourlyStartTime: yup.string().when("dayPart", {
                  is: DayPart.Hourly,
                  then: yup.string().required(t("Required")),
                }),
                hourlyEndTime: yup.string().when("dayPart", {
                  is: DayPart.Hourly,
                  then: yup.string().required(t("Required")),
                }),
              })
            ),

            // Notes To Approver if notes are required
            // Accounting Code Allocations

            // accountingCodeAllocations: yup.object().test({
            //   name: "accountingCodeAllocationsCheck",
            //   test: function test(value: AbsenceFormData) {
            //     const accountingCodeAllocations =
            //       value.accountingCodeAllocations;

            //     const error = validateAccountingCodeAllocations(
            //       accountingCodeAllocations ?? [],
            //       t
            //     );
            //     if (!error) {
            //       return true;
            //     }

            //     return new yup.ValidationError(
            //       error,
            //       null,
            //       `${this.path}.accountingCodeAllocations`
            //     );
            //   },
            // })
          })}
          onSubmit={async (data, e) => {
            const absenceInput = buildAbsenceInput(
              isCreate,
              data,
              state,
              disabledDates,
              false
            );
            if (absenceInput != null) {
              const absence = await saveAbsence(absenceInput, () => {});
              console.log(absence);
            }
          }}
        >
          {({
            values,
            handleSubmit,
            handleReset,
            setFieldValue,
            dirty,
            isSubmitting,
            resetForm,
            touched,
            initialValues,
            errors,
          }) => (
            <form id="absence-form" onSubmit={handleSubmit}>
              <AbsenceVacancyHeader
                pageHeader={isCreate ? t("Create absence") : t("Edit absence")}
                subHeader={
                  !actingAsEmployee
                    ? `${employee.firstName} ${employee.lastName}`
                    : undefined
                }
              />
              <Section className={classes.content}>
                {/* <ErrorBanner
                errorBannerOpen={errorBannerOpen}
                title={t("There was an issue creating the absence")}
                apolloErrors={absenceErrors}
                setErrorBannerOpen={setErrorBannerOpen}
                continueAction={async () => await create(formValues, true)}
              /> */}
                <Grid container spacing={2}>
                  <Grid item md={5}>
                    <AbsenceDetails
                      organizationId={organizationId}
                      employeeId={employee.id}
                      actingAsEmployee={actingAsEmployee}
                      absenceDates={state.absenceDates}
                      onToggleAbsenceDate={d => {
                        dispatch({ action: "toggleDate", date: d });
                        // Update the details in the form
                        const exists = values.details.find(x =>
                          isSameDay(x.date, d)
                        );
                        if (exists) {
                          setFieldValue(
                            "details",
                            values.details.filter(x => !isSameDay(x.date, d)),
                            false
                          );
                        } else {
                          setFieldValue(
                            "details",
                            sortBy(
                              [
                                ...values.details,
                                copyDetail(d, values.details),
                              ],
                              d => d.date
                            ),
                            false
                          );
                        }
                      }}
                      closedDates={[]}
                      currentMonth={state.viewingCalendarMonth}
                      onSwitchMonth={(d: Date) =>
                        dispatch({ action: "switchMonth", month: d })
                      }
                      absenceInput={
                        buildAbsenceInput(
                          true,
                          values,
                          state,
                          disabledDates,
                          false
                        ) as AbsenceCreateInput
                      }
                      positionTypeId={position?.positionTypeId}
                    />
                  </Grid>
                  <Grid item md={6}>
                    <SubstituteDetails
                      organizationId={organizationId}
                      actingAsEmployee={actingAsEmployee}
                      needsReplacement={
                        position?.needsReplacement ?? NeedsReplacement.No
                      }
                      absenceInput={
                        buildAbsenceInput(
                          true,
                          values,
                          state,
                          disabledDates,
                          false
                        ) as AbsenceCreateInput
                      }
                      onPreArrangeClick={() => {}}
                      onEditSubDetailsClick={() => {}}
                    />
                  </Grid>
                </Grid>
              </Section>
              <ContentFooter>
                <Grid item xs={12} className={classes.contentFooter}>
                  <div className={classes.actionButtons}>
                    <div className={classes.unsavedText}>
                      {(dirty || isCreate) && (
                        <Typography>
                          {t("This page has unsaved changes")}
                        </Typography>
                      )}
                    </div>
                    {deleteAbsence && !dirty && (
                      <Can do={[PermissionEnum.AbsVacDelete]}>
                        <Button
                          onClick={() => deleteAbsence()}
                          variant="text"
                          className={classes.deleteButton}
                        >
                          {t("Delete")}
                        </Button>
                      </Can>
                    )}
                    {!isCreate && dirty && !state.isClosed && (
                      <Button
                        onClick={() => {
                          // reset the form and the state
                          resetForm();
                        }}
                        variant="outlined"
                        className={classes.cancelButton}
                        disabled={!dirty}
                      >
                        {t("Discard Changes")}
                      </Button>
                    )}
                    {canSaveAbsence(values.details) && (
                      <Button
                        form="absence-form"
                        type="submit"
                        variant="contained"
                        className={classes.saveButton}
                        disabled={
                          !dirty ||
                          //negativeBalanceWarning ||
                          state.isClosed
                        }
                      >
                        {isCreate ? t("Create") : t("Save")}
                      </Button>
                    )}
                  </div>
                </Grid>
              </ContentFooter>
            </form>
          )}
        </Formik>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subtitle: {
    fontSize: theme.typography.pxToRem(24),
  },
  content: {
    marginTop: theme.spacing(3),
  },
  contentFooter: {
    height: theme.typography.pxToRem(72),
    width: theme.customSpacing.contentWidth,
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
  deleteButton: {
    color: theme.customColors.darkRed,
    marginRight: theme.spacing(2),
    textDecoration: "underline",
  },
  cancelButton: {
    marginRight: theme.spacing(2),
    color: "#050039",
  },
  saveButton: {
    marginRight: theme.spacing(4),
  },
}));

const copyDetail = (
  date: Date,
  existingDetails: AbsenceDetail[]
): AbsenceDetail => {
  if (!existingDetails || existingDetails.length === 0) {
    return { date };
  }

  const firstDetail = existingDetails[0];
  return {
    ...firstDetail,
    id: undefined,
    date: date,
  };
};

const buildAbsenceInput = (
  isCreate: boolean,
  formValues: AbsenceFormData,
  state: AbsenceState,
  disabledDates: Date[],
  hasEditedDetails: boolean
  //vacancyDetails?: VacancyDetail[],
): AbsenceCreateInput | AbsenceUpdateInput | null => {
  if (
    hasIncompleteDetails(formValues.details) ||
    formValues.details.length === 0
  ) {
    return null;
  }
  const dates = getAbsenceDates(
    formValues.details.map(d => d.date),
    disabledDates
  );
  if (!dates) return null;

  let absence: AbsenceCreateInput | AbsenceUpdateInput;
  if (isCreate) {
    absence = {
      orgId: state.organizationId,
      employeeId: state.employeeId,
    };
  } else {
    absence = {
      id: state.absenceId ?? "0",
      rowVersion: state.absenceRowVersion ?? "",
    };
  }

  // Add properties that span create and update
  absence = {
    ...absence,
    notesToApprover: formValues.notesToApprover,
    adminOnlyNotes: formValues.adminOnlyNotes,
    details: createAbsenceDetailInput(formValues.details),
  };

  // If the Vacancy Details records have selections, we don't want to send
  // the associated property on the parent Vacancy to the server.
  // const detailsHaveDifferentAccountingCodeSelections =
  //   hasEditedDetails &&
  //   vacancyDetails &&
  //   vacancyDetailsHaveDifferentAccountingCodeSelections(
  //     vacancyDetails,
  //     formValues.accountingCodeAllocations
  //       ? formValues.accountingCodeAllocations
  //       : null
  //   );
  // const detailsHaveDifferentPayCodeSelections =
  //   hasEditedDetails &&
  //   vacancyDetails &&
  //   vacancyDetailsHaveDifferentPayCodeSelections(
  //     vacancyDetails,
  //     formValues.payCode ? formValues.payCode : null
  //   );

  // const vDetails =
  //   vacancyDetails?.map(v => ({
  //     date: v.date,
  //     locationId: v.locationId,
  //     startTime: secondsSinceMidnight(
  //       parseTimeFromString(format(convertStringToDate(v.startTime)!, "h:mm a"))
  //     ),
  //     endTime: secondsSinceMidnight(
  //       parseTimeFromString(format(convertStringToDate(v.endTime)!, "h:mm a"))
  //     ),
  //     payCodeId: !detailsHaveDifferentPayCodeSelections
  //       ? undefined
  //       : v.payCodeId
  //       ? v.payCodeId
  //       : null,
  //     accountingCodeAllocations: !detailsHaveDifferentAccountingCodeSelections
  //       ? undefined
  //       : mapAccountingCodeValueToAccountingCodeAllocations(
  //           v.accountingCodeAllocations,
  //           true
  //         ),
  //   })) || undefined;

  // Populate the Vacancies on the Absence
  absence = {
    ...absence,
    /* TODO: When we support multi Position Employees we'll need to account for the following:
          When creating an Absence, there must be 1 Vacancy created here per Position Id.
      */
    vacancies: [
      {
        positionId: state.positionId,
        //useSuppliedDetails: vDetails !== undefined,
        useSuppliedDetails: false,
        needsReplacement: formValues.needsReplacement,
        notesToReplacement: formValues.notesToReplacement,
        //prearrangedReplacementEmployeeId: formValues.replacementEmployeeId,
        //details: vDetails,
        // accountingCodeAllocations:
        //   !detailsHaveDifferentAccountingCodeSelections &&
        //   formValues.accountingCodeAllocations
        //     ? mapAccountingCodeValueToAccountingCodeAllocations(
        //         formValues.accountingCodeAllocations,
        //         true
        //       )
        //     : undefined,
        // payCodeId:
        //   !detailsHaveDifferentPayCodeSelections && formValues.payCode
        //     ? formValues.payCode
        //     : undefined,
      },
    ],
  };
  return absence;
};

const createAbsenceDetailInput = (
  details: AbsenceDetail[]
): AbsenceDetailCreateInput[] => {
  return details.map(d => {
    let detail: AbsenceDetailCreateInput = {
      date: format(d.date, "P"),
      dayPartId: d.dayPart,
      reasons: [{ absenceReasonId: d.absenceReasonId }],
    };

    if (d.dayPart === DayPart.Hourly) {
      detail = {
        ...detail,
        startTime: secondsSinceMidnight(
          parseTimeFromString(format(d.hourlyStartTime!, "h:mm a"))
        ),
        endTime: secondsSinceMidnight(
          parseTimeFromString(format(d.hourlyEndTime!, "h:mm a"))
        ),
      };
    }

    return detail;
  });
};

const hasIncompleteDetails = (details: AbsenceDetail[]): boolean => {
  const incompleteDetail = details.find(
    d =>
      !d.absenceReasonId ||
      !d.dayPart ||
      (d.dayPart === DayPart.Hourly &&
        (!d.hourlyStartTime ||
          !d.hourlyEndTime ||
          isBefore(d.hourlyEndTime, d.hourlyStartTime)))
  );
  return !!incompleteDetail;
};
