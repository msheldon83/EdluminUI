import * as React from "react";
import {
  Typography,
  FormControlLabel,
  Checkbox,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { PositionType, PermissionEnum } from "graphql/server-types.gen";
import { useRouteParams } from "ui/routes/definition";
import { useLocation } from "react-router-dom";
import { AbsenceReasonViewEditRoute } from "ui/routes/absence-reason";
import { usePositionTypeOptions } from "reference-data/position-types";
import { Formik } from "formik";
import { Select, OptionType } from "ui/components/form/select";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { PositionTypeLink } from "ui/components/links/position-types";

type Props = {
  absenceReasonId: string;
  absenceReasonName: string;
  positionTypes: Pick<PositionType, "id" | "name">[];
  allPositionTypes: boolean;
  updatePositionTypes: (values: {
    allPositionTypes?: boolean | null;
    posititionTypeIds?: string[] | null;
  }) => Promise<any>;
};

export const AbsenceReasonPositionTypesCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const [editing, setEditing] = React.useState(false);
  const location = useLocation();

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
                    {t("Not valid for any position types")}
                  </Typography>
                )}
              {!editing && props.allPositionTypes && (
                <Typography>{t("Valid for all position types")}</Typography>
              )}
              {!editing &&
                !props.allPositionTypes &&
                props.positionTypes.length > 0 && (
                  <>
                    {props.positionTypes
                      .slice()
                      .sort((pt1, pt2) => pt1.name.localeCompare(pt2.name))
                      .map((pt, i) => (
                        <Typography key={pt.id}>
                          <PositionTypeLink
                            positionTypeId={pt.id}
                            state={{
                              comingFrom: `${props.absenceReasonName} settings`,
                              returnLocation: location,
                            }}
                          >
                            {pt.name}
                          </PositionTypeLink>
                        </Typography>
                      ))}
                  </>
                )}
              {editing && (
                <FormControlLabel
                  label={t("All Position Types")}
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
                <Select
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
