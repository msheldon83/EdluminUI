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
import {
  useAbsenceReasons,
  useAbsenceReasonOptions,
} from "reference-data/absence-reasons";
import { useMutationBundle } from "graphql/hooks";
import { UpdateAbsenceReason } from "ui/pages/absence-reason/graphql/update-absence-reason.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {
  positionTypeId: string;
  updateAbsenceReasons: (values: {
    absenceReasonIds?: string[] | null;
  }) => Promise<any>;
};

export const PositionTypeAbsReasonsCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const [editing, setEditing] = React.useState(false);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const absenceReasons = useAbsenceReasons(params.organizationId);
  const filteredAbsenceReasons = absenceReasons.filter(ar =>
    ar.positionTypeIds.includes(props.positionTypeId)
  );
  const absenceReasonOptions = useAbsenceReasonOptions(params.organizationId);

  const [updateAbsenceReason] = useMutationBundle(UpdateAbsenceReason, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleUpdateAbsenceReason = async (values: {
    absenceReasonIds: string[];
  }) => {
    const removedFromAbsReasons = filteredAbsenceReasons.filter(
      ar => !values.absenceReasonIds.includes(ar.id)
    );
    const absReasons = absenceReasons.filter(ar =>
      values.absenceReasonIds.includes(ar.id)
    );

    //handle removals
    for (let i = 0; i < removedFromAbsReasons.length; i++) {
      removedFromAbsReasons[i].positionTypeIds = removedFromAbsReasons[
        i
      ].positionTypeIds.filter(a => props.positionTypeId);
      await updateAbsenceReason({
        variables: {
          absenceReason: {
            id: absReasons[1].id,
            rowVersion: absReasons[i].rowVersion,
            allowNegativeBalance: absReasons[i].allowNegativeBalance,
            isRestricted: absReasons[i].isRestricted,
            positionTypeIds: absReasons[i].positionTypeIds,
          },
        },
      });
    }

    //handle additions
    for (let i = 0; i < absReasons.length; i++) {
      if (!absReasons[i]?.positionTypeIds.includes(props.positionTypeId)) {
        absReasons[i].positionTypeIds.push(props.positionTypeId);

        await updateAbsenceReason({
          variables: {
            absenceReason: {
              id: absReasons[1].id,
              rowVersion: absReasons[i].rowVersion,
              allowNegativeBalance: absReasons[i].allowNegativeBalance,
              isRestricted: absReasons[i].isRestricted,
              positionTypeIds: absReasons[i].positionTypeIds,
            },
          },
        });
      }
    }
  };

  return (
    <>
      <Section>
        <Formik
          initialValues={{
            absenceReasonIds: filteredAbsenceReasons.map(pt => pt.id),
          }}
          onSubmit={async (data, e) => {
            await handleUpdateAbsenceReason(data);
            setEditing(false);
          }}
        >
          {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
            <>
              <SectionHeader
                title={t("Associated absence reasons")}
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

              {!editing && filteredAbsenceReasons.length === 0 && (
                <Typography>
                  {t("Not associated with any absence reasons")}
                </Typography>
              )}

              {!editing && filteredAbsenceReasons.length > 0 && (
                <>
                  {filteredAbsenceReasons.map((ar, i) => (
                    <Chip
                      key={i}
                      label={ar.name}
                      className={classes.positionTypeChip}
                    />
                  ))}
                </>
              )}
              {console.log(
                "values",
                absenceReasonOptions.filter(
                  e =>
                    e.value &&
                    values.absenceReasonIds &&
                    values.absenceReasonIds.includes(e.value.toString())
                )
              )}
              {editing && (
                <SelectNew
                  value={
                    absenceReasonOptions.filter(
                      e =>
                        e.value &&
                        values.absenceReasonIds &&
                        values.absenceReasonIds.includes(e.value.toString())
                    ) ?? { label: "", value: "" }
                  }
                  options={absenceReasonOptions}
                  multiple={true}
                  onChange={e => {
                    const ids = e.map((v: OptionType) => v.value.toString());
                    setFieldValue("absenceReasonIds", ids);
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
