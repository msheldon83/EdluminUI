import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { usePositionTypes } from "reference-data/position-types";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { Check, Clear, Edit } from "@material-ui/icons";

type Props = {
  orgId: string;
  positionTypeIds: string[];
  isAllOthers: boolean;
  onSave?: (positionTypeIds: string[], isAllOthers: boolean) => void;
  editing: string | null;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  editable: boolean;
};

export const editableSections = {
  positionTypes: "edit-position-types",
};

export const PositionTypeEdit: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const allPositionTypes = usePositionTypes(props.orgId);

  const positionTypeText = props.isAllOthers
    ? t("All non-specified")
    : props.positionTypeIds.length === 0
    ? t("None")
    : allPositionTypes
        .filter(x => props.positionTypeIds.includes(x.id))
        .map(x => x.name)
        .join(", ");

  return (
    <Formik
      initialValues={{
        positionTypeIds: props.positionTypeIds,
        isAllOthers: props.isAllOthers,
      }}
      onSubmit={(data, e) => {
        if (props.onSave) {
          props.onSave(data.positionTypeIds, data.isAllOthers);
        }
      }}
    >
      {({ values, handleSubmit, submitForm, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          {props.editing !== editableSections.positionTypes ? (
            <div className={classes.container}>
              <div className={classes.text}>{`${t(
                "For position types"
              )}: ${positionTypeText}`}</div>
              {props.editable && (
                <Edit
                  className={classes.editIcon}
                  onClick={() => {
                    props.setEditing!(editableSections.positionTypes);
                  }}
                />
              )}
            </div>
          ) : (
            <div className={classes.container}>
              <div className={classes.text}>{`${t(
                "For position types"
              )}:  `}</div>
              <PositionTypeSelect
                orgId={props.orgId}
                includeAllOption={false}
                selectedPositionTypeIds={values.positionTypeIds}
                setSelectedPositionTypeIds={(ids?: string[]) =>
                  setFieldValue("positionTypeIds", ids)
                }
                disabled={values.isAllOthers}
              />
              <Clear
                className={classes.icon}
                onClick={() => {
                  props.setEditing!(null);
                }}
              />
              <Check className={classes.icon} onClick={submitForm} />
            </div>
          )}
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  text: {
    fontSize: theme.typography.pxToRem(24),
  },
  container: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    cursor: "pointer",
    marginLeft: theme.spacing(1),
  },
  editIcon: {
    cursor: "pointer",
    color: theme.customColors.edluminSubText,
    height: theme.typography.pxToRem(15),
    width: theme.typography.pxToRem(15),
    marginLeft: theme.spacing(1),
  },
}));
