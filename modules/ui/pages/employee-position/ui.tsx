import * as React from "react";
import {
  Collapse,
  Divider,
  Grid,
  Link,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { useMemo } from "react";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useQueryBundle } from "graphql/hooks";
import { usePositionTypes } from "reference-data/position-types";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { ActionButtons } from "ui/components/action-buttons";
import * as yup from "yup";
import { Formik } from "formik";
import { EmployeeInput } from "graphql/server-types.gen";

type Props = {
  position: any;
  onSave: (employee: EmployeeInput) => Promise<unknown>;
  onCancel: () => void;
  submitLabel: string;
};

export const PositionEditUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const positionTypes = usePositionTypes();
  const positionTypeOptions: OptionType[] = useMemo(
    () => positionTypes.map(p => ({ label: p.name, value: p.id })),
    [positionTypes]
  );

  return (
    <>
      <Formik
        initialValues={{}}
        onSubmit={async (data, e) => {
          await props.onSave({});
        }}
        validationSchema={yup.object({})}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader title={t("Position")} />
              <ActionButtons
                submit={{ text: props.submitLabel, execute: submitForm }}
                cancel={{ text: t("Cancel"), execute: props.onCancel! }}
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
