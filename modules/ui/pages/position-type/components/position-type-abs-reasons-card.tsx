import * as React from "react";
import {
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  makeStyles,
  Divider,
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
import { AbsenceReason } from "ui/pages/absence-reason";

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

  const [
    filteredAbsenceReasonIds,
    setFilteredAbsenceReasonIds,
  ] = React.useState<any[]>();

  const allPositionTypeAbsenceReasons = absenceReasons.filter(
    ar => ar.allPositionTypes
  );

  const absenceReasonOptions = absenceReasons
    .filter(ar => !ar.allPositionTypes)
    .map(r => ({ label: r.name, value: r.id }));

  const [updateAbsenceReason] = useMutationBundle(UpdateAbsenceReason, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleUpdateAbsenceReason = async (values: {
    absenceReasonIds: string[];
  }) => {
    const existingIds = filteredAbsenceReasonIds;
    const removedFromAbsReasons =
      existingIds?.filter(ar => !values.absenceReasonIds.includes(ar)) ?? [];
    const addedAbsReasons =
      values.absenceReasonIds.filter(ar => !existingIds?.includes(ar)) ?? [];

    //handle removals
    for (let i = 0; i < removedFromAbsReasons.length ?? 0; i++) {
      const ar = absenceReasons.find(a => a.id === removedFromAbsReasons[i]);
      if (ar) {
        const newPositionTypeIds = ar.positionTypeIds.filter(
          (a: any) => props.positionTypeId !== a
        );

        await updateAbsenceReason({
          variables: {
            absenceReason: {
              id: ar.id,
              rowVersion: ar.rowVersion,
              allowNegativeBalance: ar.allowNegativeBalance,
              isRestricted: ar.isRestricted,
              positionTypeIds: newPositionTypeIds,
            },
          },
        });
      }
    }
    //handle additions
    for (let i = 0; i < addedAbsReasons.length; i++) {
      const ar = absenceReasons.find(a => a.id === addedAbsReasons[i]);
      if (ar && !ar.positionTypeIds.includes(props.positionTypeId)) {
        ar.positionTypeIds.push(props.positionTypeId);
        await updateAbsenceReason({
          variables: {
            absenceReason: {
              id: ar.id,
              rowVersion: ar.rowVersion,
              allowNegativeBalance: ar.allowNegativeBalance,
              isRestricted: ar.isRestricted,
              positionTypeIds: ar.positionTypeIds,
            },
          },
        });
      }
    }
    setFilteredAbsenceReasonIds(values.absenceReasonIds);
  };

  if (absenceReasons.length === 0) {
    return <></>;
  }

  if (!filteredAbsenceReasonIds) {
    setFilteredAbsenceReasonIds(
      absenceReasons
        .filter(ar => ar.positionTypeIds.includes(props.positionTypeId))
        .map(ar => ar.id)
    );
  }

  return (
    <>
      <Section>
        <Formik
          initialValues={{
            absenceReasonIds: filteredAbsenceReasonIds ?? [],
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

              {!editing &&
                filteredAbsenceReasonIds &&
                filteredAbsenceReasonIds.length === 0 && (
                  <>
                    <Typography>
                      {t("Not associated with any absence reasons")}
                    </Typography>
                    <Typography>
                      {t(
                        "The following Absence Reasons are assoicated with this position type because they are assoicated with all position types:"
                      )}
                    </Typography>
                  </>
                )}

              {!editing &&
                filteredAbsenceReasonIds &&
                filteredAbsenceReasonIds.length > 0 && (
                  <>
                    {filteredAbsenceReasonIds.map((ar, i) => (
                      <Chip
                        key={i}
                        label={absenceReasons.find(a => a.id == ar)?.name}
                        className={classes.positionTypeChip}
                      />
                    ))}
                    {allPositionTypeAbsenceReasons.length > 0 && (
                      <>
                        <Typography className={classes.allReasonsText}>
                          {t(
                            "The following Absence Reasons are assoicated with this position type because they are assoicated with all position types:"
                          )}
                        </Typography>
                        {allPositionTypeAbsenceReasons.map((ar, i) => (
                          <Chip
                            key={i}
                            label={ar.name}
                            className={classes.positionTypeChip}
                          />
                        ))}
                      </>
                    )}
                  </>
                )}
              {editing && allPositionTypeAbsenceReasons.length > 0 && (
                <>
                  <Typography className={classes.allReasonsText}>
                    {t(
                      "The following Absence Reasons are assoicated with this position type because they are assoicated with all position types and can not be chosen:"
                    )}
                  </Typography>
                  <div className={classes.chipContainer}>
                    {allPositionTypeAbsenceReasons.map((ar, i) => (
                      <Chip
                        key={i}
                        label={ar.name}
                        className={classes.positionTypeChip}
                      />
                    ))}
                  </div>
                  <Divider className={classes.divider} />
                </>
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
  allReasonsText: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  chipContainer: {
    marginBottom: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));
