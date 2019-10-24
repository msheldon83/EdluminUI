import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { Edit, Clear, Check } from "@material-ui/icons";
import { Option, ActionMenu } from "./action-menu";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { useScreenSize } from "hooks";

type Props = {
  text: string | null | undefined;
  label: string;
  actions?: Array<Option>;
  editable?: boolean;
  onEdit?: Function;
  validationSchema?: any;
  onSubmit?: Function;
  onCancel?: Function;
  isSubHeader?: boolean;
  showLabel?: boolean;
};

export const PageHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [editing, setEditing] = React.useState(false);

  const wrapper = (child: JSX.Element) => {
    return (
      <div className={classes.header}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          spacing={2}
          className={`${props.isSubHeader ? classes.subHeader : ""}`}
        >
          {child}
          {props.actions && (
            <Grid item>
              <ActionMenu options={props.actions} />
            </Grid>
          )}
        </Grid>
      </div>
    );
  };

  const headerIsEditable =
    props.editable && props.onEdit && props.onSubmit && props.onCancel;

  const display = props.text ? (
    props.text
  ) : (
    <span className={classes.valueMissing}>Not Specified</span>
  );

  if (!editing) {
    return wrapper(
      <Grid item>
        <Grid item container alignItems="center" spacing={2}>
          <Grid item>
            {props.showLabel && (
              <span className={classes.label}>{`${props.label}: `}</span>
            )}
            {!props.isSubHeader ? <h1>{display}</h1> : <span>{display}</span>}
          </Grid>
          <Grid item>
            {headerIsEditable && (
              <Edit
                className={
                  props.isSubHeader ? classes.smallAction : classes.action
                }
                onClick={() => {
                  props.onEdit!();
                  setEditing(true);
                }}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return wrapper(
    <Formik
      initialValues={{ value: props.text }}
      onSubmit={async (data, meta) => {
        await props.onSubmit!(data);
        setEditing(false);
      }}
      validationSchema={props.validationSchema || null}
    >
      {({ handleSubmit, submitForm }) => (
        <form onSubmit={handleSubmit}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <FormTextField
                label={props.label}
                name="value"
                margin={isMobile ? "normal" : "none"}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item>
              <Clear
                className={
                  props.isSubHeader ? classes.smallAction : classes.action
                }
                onClick={() => {
                  setEditing(false);
                  props.onCancel!();
                }}
              />
            </Grid>
            <Grid item>
              <Check
                className={
                  props.isSubHeader ? classes.smallAction : classes.action
                }
                onClick={submitForm}
              />
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginLeft: theme.spacing(),
    "& h1": {
      margin: 0,
    },
  },
  subHeader: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontWeight: 500,
  },
  action: {
    cursor: "pointer",
  },
  smallAction: {
    cursor: "pointer",
    height: "0.75em",
  },
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));
