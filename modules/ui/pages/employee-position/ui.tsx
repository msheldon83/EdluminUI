import * as React from "react";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { useMemo } from "react";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { usePositionTypes } from "reference-data/position-types";
import { useContracts } from "reference-data/contracts";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { ActionButtons } from "ui/components/action-buttons";
import * as yup from "yup";
import { Formik } from "formik";
import { PositionInput, NeedsReplacement } from "graphql/server-types.gen";
import { OptionTypeBase } from "react-select/src/types";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { PeopleRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { GetPositionTypes } from "./graphql/get-positiontypes.gen";

type Props = {
  position?:
    | {
        positionType?: { id: string } | null | undefined;
        name?: string | null | undefined;
        needsReplacement?: NeedsReplacement | null | undefined;
        currentContract?: { id: string } | null | undefined;
        hoursPerFullWorkDay?: number | null | undefined;
      }
    | null
    | undefined;
  onSave: (position: PositionInput) => Promise<unknown>;
  onCancel: () => void;
  submitLabel: string;
  setPositionTypeName?: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};

export const PositionEditUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PeopleRoute);

  const position = props.position;

  const getPositionTypes = useQueryBundle(GetPositionTypes, {
    fetchPolicy: "cache-first",
    variables: { orgId: params.organizationId },
  });

  const positionTypes = useMemo(() => {
    if (
      getPositionTypes.state === "DONE" &&
      getPositionTypes.data.positionType
    ) {
      return compact(getPositionTypes.data.positionType.all) ?? [];
    }
    return [];
  }, [getPositionTypes]);
  const positionTypeOptions: OptionType[] = useMemo(
    () => positionTypes.map(p => ({ label: p.name, value: p.id })),
    [positionTypes]
  );

  const contracts = useContracts(params.organizationId);
  const contractOptions: OptionType[] = useMemo(
    () => contracts.map(p => ({ label: p.name, value: p.id })),
    [contracts]
  );

  const needsReplacementOptions: OptionType[] = useMemo(
    () => [
      { label: t("Yes"), value: NeedsReplacement.Yes },
      { label: t("No"), value: NeedsReplacement.No },
      { label: t("Employee can choose"), value: NeedsReplacement.Sometimes },
    ],
    [t]
  );

  return (
    <>
      <Formik
        initialValues={{
          positionTypeId: position?.positionType?.id ?? "",
          title: position?.name ?? "",
          needsReplacement: position?.needsReplacement ?? NeedsReplacement.Yes,
          contractId: position?.currentContract?.id ?? "",
          hoursPerFullWorkDay: position?.hoursPerFullWorkDay,
        }}
        onSubmit={async (data, e) => {
          await props.onSave({
            positionType: { id: data.positionTypeId },
            title: data.title,
            needsReplacement: data.needsReplacement,
            contract: { id: data.contractId },
            hoursPerFullWorkDay: data.hoursPerFullWorkDay,
          });
        }}
        validationSchema={yup.object({
          positionTypeId: yup
            .string()
            .nullable()
            .required(t("A position type must be selected")),
          title: yup
            .string()
            .nullable()
            .required(t("A position title is required")),
          needsReplacement: yup
            .string()
            .nullable()
            .required(t("Needs replacement is required")),
          contractId: yup
            .string()
            .nullable()
            .required(t("A contract must be selected")),
          hoursPerFullWorkDay: yup.number().nullable(),
        })}
      >
        {({
          values,
          handleSubmit,
          handleChange,
          submitForm,
          setFieldValue,
          errors,
        }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader title={t("Position")} />
              <Grid container spacing={2}>
                <Grid item container spacing={2}>
                  <Grid item xs={4}>
                    <Typography>{t("Position Type")}</Typography>
                    <SelectNew
                      value={positionTypeOptions.find(
                        e => e.value && e.value === values.positionTypeId
                      )}
                      multiple={false}
                      onChange={(value: OptionType) => {
                        const id = (value as OptionTypeBase).value;
                        setFieldValue("positionTypeId", id);
                        const pt = positionTypes.find(x => x.id === id);
                        if (pt?.needsReplacement) {
                          setFieldValue(
                            "needsReplacement",
                            pt.needsReplacement
                          );
                        }
                        if (pt?.defaultContractId) {
                          setFieldValue(
                            "contractId",
                            pt.defaultContractId.toString()
                          );
                        }
                        if (props.setPositionTypeName) {
                          props.setPositionTypeName(value.label);
                        }
                      }}
                      options={positionTypeOptions}
                      inputStatus={errors.positionTypeId ? "error" : undefined}
                      validationMessage={errors.positionTypeId}
                      withResetValue={false}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>{t("Title")}</Typography>
                    <Input
                      value={values.title}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        placeholder: `E.g 3rd Grade Math`,
                        name: "title",
                        id: "title",
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid item container spacing={2}>
                  <Grid item xs={4}>
                    <Typography>{t("Needs Replacement")}</Typography>
                    <SelectNew
                      value={needsReplacementOptions.find(
                        e => e.value && e.value === values.needsReplacement
                      )}
                      multiple={false}
                      onChange={(value: OptionType) => {
                        const id = (value as OptionTypeBase).value;
                        setFieldValue("needsReplacement", id);
                      }}
                      options={needsReplacementOptions}
                      withResetValue={false}
                    />
                  </Grid>
                </Grid>
                <Grid item container spacing={2}>
                  <Grid item xs={4}>
                    <Typography>{t("Contract")}</Typography>
                    <SelectNew
                      value={contractOptions.find(
                        e => e.value && e.value === values.contractId
                      )}
                      multiple={false}
                      onChange={(value: OptionType) => {
                        const id = (value as OptionTypeBase).value;
                        setFieldValue("contractId", id);
                      }}
                      options={contractOptions}
                      inputStatus={errors.contractId ? "error" : undefined}
                      validationMessage={errors.contractId}
                      withResetValue={false}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography>{t("Hours in full day")}</Typography>
                    <Input
                      value={values.hoursPerFullWorkDay}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        placeholder: `E.g 8`,
                        name: "hoursPerFullWorkDay",
                        id: "hoursPerFullWorkDay",
                        fullWidth: false,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <ActionButtons
                submit={{ text: props.submitLabel, execute: submitForm }}
                cancel={{ text: t("Cancel"), execute: props.onCancel }}
              />
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
  cancel: { color: theme.customColors.darkRed },
}));
