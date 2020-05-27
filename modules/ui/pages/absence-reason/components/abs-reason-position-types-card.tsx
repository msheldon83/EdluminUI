import * as React from "react";
import {
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { PositionType, PermissionEnum } from "graphql/server-types.gen";
import { useRouteParams } from "ui/routes/definition";
import { AbsenceReasonViewEditRoute } from "ui/routes/absence-reason";
import { usePositionTypeOptions } from "reference-data/position-types";
import { Formik } from "formik";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  positionTypes: Pick<PositionType, "id" | "name">[];
  allPositionTypes: boolean;
  editable: boolean;
  updatePositionTypes: (values: {
    allPositionTypes?: boolean | null;
    posititionTypeIds?: string[] | null;
  }) => Promise<any>;
};

export const AbsenceReasonPositionTypesCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const [editing, setEditing] = React.useState(false);
  const classes = useStyles();

  const positionTypeOptions = usePositionTypeOptions(params.organizationId);

  return (
    <>
      <Section>
        <Formik
          initialValues={{
            positionTypeIds: props.positionTypes.map(pt => pt.id),
            allPositionTypes: props.allPositionTypes,
          }}
          onSubmit={async (data, e) => {
            data.positionTypeIds = data.allPositionTypes
              ? []
              : data.positionTypeIds;
            await props.updatePositionTypes(data);
            setEditing(false);
          }}
        >
          {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
            <>
              <SectionHeader
                title={t("Valid for position types")}
                actions={[
                  {
                    text: t("Edit"),
                    visible: !editing,
                    execute: () => {
                      setEditing(true);
                    },
                    permissions: [PermissionEnum.AbsVacSettingsSave],
                  },
                ]}
                cancel={{
                  text: t("Cancel"),
                  visible: editing,
                  execute: () => {
                    setEditing(false);
                  },
                }}
                submit={{
                  text: t("Save"),
                  visible: editing,
                  execute: () => {
                    handleSubmit();
                  },
                }}
              />

              {!editing &&
                !props.allPositionTypes &&
                props.positionTypes.length === 0 && (
                  <Typography>
                    {t("Not valid for any postion types")}
                  </Typography>
                )}
              {!editing && props.allPositionTypes && (
                <Typography>{t("Valid for all position types")}</Typography>
              )}
              {!editing &&
                !props.allPositionTypes &&
                props.positionTypes.length > 0 && (
                  <>
                    {props.positionTypes.map((pt, i) => (
                      <Chip
                        key={i}
                        label={pt.name}
                        className={classes.positionTypeChip}
                      />
                    ))}
                  </>
                )}
              {editing && (
                <FormControlLabel
                  label={t("All Postion Types")}
                  control={
                    <Checkbox
                      checked={values.allPositionTypes}
                      onChange={e => {
                        setFieldValue("allPositionTypes", e.target.checked);
                      }}
                      value={values.allPositionTypes}
                      color="primary"
                    />
                  }
                />
              )}
              {editing && !values.allPositionTypes && (
                <SelectNew
                  value={
                    positionTypeOptions.filter(
                      e =>
                        e.value &&
                        values.positionTypeIds &&
                        values.positionTypeIds.includes(e.value.toString())
                    ) ?? { label: "", value: "" }
                  }
                  options={positionTypeOptions}
                  multiple={true}
                  onChange={e => {
                    const ids = e.map((v: OptionType) => v.value.toString());
                    setFieldValue("positionTypeIds", ids);
                  }}
                />
              )}
            </>
          )}
        </Formik>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  positionTypeChip: {
    background: theme.customColors.blue,
    color: theme.customColors.white,
    marginRight: theme.spacing(1),
  },
}));
