import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Formik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "hooks/use-snackbar";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetOrganizationById } from "./graphql/get-organization.gen";
import { UpdateOrganization } from "./graphql/update-organization.gen";
import { useRouteParams } from "ui/routes/definition";
import { SettingsRoute } from "ui/routes/settings";
import { Section } from "ui/components/section";
import { ShowErrors } from "ui/components/error-helpers";
import { PageTitle } from "ui/components/page-title";
import { HoursToDaysTable } from "./components/hours-to-days-table";
import { DayConversion, HoursToDaysData } from "./types";

type Props = {};

export const HoursToDays: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SettingsRoute);
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const getOrganization = useQueryBundle(GetOrganizationById, {
    variables: { id: params.organizationId },
  });
  const [updateOrg] = useMutationBundle(UpdateOrganization, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  if (getOrganization.state === "LOADING") {
    return <></>;
  }

  const organization = getOrganization?.data?.organization?.byId;

  if (!organization) {
    return <></>;
  }

  const onCancel = async () => {
    history.push(SettingsRoute.generate(params));
  };

  const updateConversions = async (conversions: DayConversion[]) => {
    const updateObject = {
      variables: {
        organization: {
          orgId: params.organizationId,
          rowVersion: organization.rowVersion,
          config: {
            vacancyDayConversions: conversions,
          },
        },
      },
    };
    const response = await updateOrg(updateObject);

    const result = response?.data?.organization?.update;
    if (result) {
      await onCancel();
    }
  };

  const deleteRow = (
    setFieldValue: (field: keyof HoursToDaysData, value: any) => void
  ) => (currentConversions: Partial<DayConversion>[], i: number) => {
    currentConversions.splice(i, 1);
    setFieldValue("conversions", currentConversions);
  };
  const addRow = (
    setFieldValue: (field: keyof HoursToDaysData, value: any) => void
  ) => (
    currentConversions: Partial<DayConversion>[],
    currentCatchAll: Partial<DayConversion>
  ) => {
    currentCatchAll.maxMinutes = undefined;
    setFieldValue("conversions", currentConversions.concat(currentCatchAll));
    setFieldValue("catchAll", {
      maxMinutes: 1440,
    });
  };

  // Initial Value creation

  // Sanitizes data to ensure the last conversion has a maxMinutes of 1440 (24 hours)
  const ensureCatchAll = (conversions: Partial<DayConversion>[]) => {
    const last =
      conversions.length === 0 ? null : conversions[conversions.length - 1];
    if (!last?.maxMinutes || last.maxMinutes < 1440) {
      return conversions.concat([
        {
          maxMinutes: 1440,
        },
      ]);
    }
    return conversions;
  };

  const initialConversions = ensureCatchAll(
    (organization.config?.vacancyDayConversions ?? []).map(input =>
      input
        ? {
            name: input.name,
            maxMinutes: input.maxMinutes,
            dayEquivalent: input.dayEquivalent,
          }
        : {}
    )
  );

  const initialValues: HoursToDaysData = {
    conversions: initialConversions.slice(0, -1),
    catchAll: initialConversions[initialConversions.length - 1],
  };

  return (
    <>
      <PageTitle title={t("Hours-to-days conversion")} />
      <Formik
        initialValues={initialValues}
        onSubmit={async data => {
          const unified = data.conversions.concat(
            data.catchAll
          ) as DayConversion[];
          await updateConversions(unified);
        }}
        validationSchema={yup.object().shape({
          conversions: yup
            .array()
            .of(
              yup.object().shape({
                maxMinutes: yup
                  .number()
                  .required(t("Required"))
                  .min(0, t("Up to must be non-negative"))
                  .max(1439, t("Up to must be less than 24 hours")),
                name: yup.string().required(t("Name must be non-empty")),
                dayEquivalent: yup
                  .number()
                  .min(0, t("Day equivalent must be non-negative"))
                  .required(t("Required")),
              })
            )
            .test({
              name: "minutesOrderedCheck",
              test: function test(conversions: DayConversion[]) {
                for (let i = 0; i < conversions.length - 1; i++) {
                  if (
                    conversions[i].maxMinutes >= conversions[i + 1].maxMinutes
                  ) {
                    return new yup.ValidationError(
                      t("Time durations out of order"),
                      null,
                      `${this.path}.${i + 1}.maxMinutes`
                    );
                  }
                }
                return true;
              },
            })
            .test({
              name: "dayOrderedCheck",
              test: function test(conversions: DayConversion[]) {
                for (let i = 0; i < conversions.length - 1; i++) {
                  if (
                    conversions[i].dayEquivalent >=
                    conversions[i + 1].dayEquivalent
                  ) {
                    return new yup.ValidationError(
                      t("Day equivalents out of order"),
                      null,
                      `${this.path}.${i + 1}.dayEquivalent`
                    );
                  }
                }
                return true;
              },
            }),
          catchAll: yup
            .object()
            .shape({
              maxMinutes: yup.number().required(t("Required")),
              name: yup.string().required(t("Required")),
              dayEquivalent: yup
                .number()
                .min(0, t("Day equivalent must be non-negative"))
                .required(t("Required")),
            })
            .when(
              "conversions",
              (conversions: Partial<DayConversion>[], schema: any) =>
                schema.test({
                  name: "catch all order",
                  test: function test(value: Partial<DayConversion>) {
                    if (
                      conversions[conversions.length - 1].dayEquivalent! >=
                      value.dayEquivalent!
                    ) {
                      return new yup.ValidationError(
                        t("Day equivalents out of order"),
                        null,
                        `conversions.${conversions.length - 1}.dayEquivalent`
                      );
                    }
                    return true;
                  },
                })
            ),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, touched }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Section>
                <h4>
                  {t(
                    "For position types that are paid in days, the assignment pay amount will be rounded up to the nearest day equivalent defined below"
                  )}
                </h4>
                <div className={classes.container}>
                  <HoursToDaysTable
                    mainPrefix="conversions"
                    mainValues={values.conversions}
                    catchAllValue={values.catchAll}
                    catchAllPrefix="catchAll"
                    addRow={addRow(setFieldValue)}
                    deleteRow={deleteRow(setFieldValue)}
                    extraActions={
                      <Button
                        onClick={submitForm}
                        variant="contained"
                        className={classes.submit}
                      >
                        {t("Save")}
                      </Button>
                    }
                  />
                </div>
              </Section>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "70%",
  },
  row: {
    padding: theme.spacing(1),
  },
  headerCell: {
    paddingRight: theme.spacing(4),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
  submit: {
    marginLeft: "auto",
    marginTop: "auto",
    backgroundColor: theme.customColors.edluminSlate,
  },
}));
