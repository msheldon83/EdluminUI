import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import {
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { ApproverGroupHeaderCreateInput } from "graphql/server-types.gen";
import { CreateApproverGroupHeader } from "./graphql/create-approver-group-header.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  ApproverGroupsRoute,
  ApproverGroupAddRemoveMembersRoute,
  ApproverGroupAddLocationsRoute,
} from "ui/routes/approver-groups";

export const ApproverGroupAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(ApproverGroupsRoute);
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("HR Office");

  const [createApproverGroupHeader] = useMutationBundle(
    CreateApproverGroupHeader,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const create = async (
    approverGroupHeader: ApproverGroupHeaderCreateInput
  ) => {
    const result = await createApproverGroupHeader({
      variables: {
        approverGroupHeader: approverGroupHeader,
      },
    });
    return result?.data?.approverGroup?.create;
  };

  const initialValues = {
    name: "",
    externalId: undefined,
    variesByLocation: false,
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
      }),
    [t]
  );

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("New Approver Group")} />
        <Typography variant="h5">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>

      <Section>
        <SectionHeader title={t("Basic info")} />
        <Formik
          initialValues={initialValues}
          validationSchema={validateBasicDetails}
          onSubmit={async (data: any) => {
            const newApproverGroupHeader: ApproverGroupHeaderCreateInput = {
              name: data.name,
              externalId: data.externalId,
              variesByLocation: data.variesByLocation,
              orgId: params.organizationId,
            };

            const result = await create(newApproverGroupHeader);
            if (!result) return;

            //Location Page
            if (newApproverGroupHeader.variesByLocation)
              history.push(
                ApproverGroupAddLocationsRoute.generate({
                  approverGroupHeaderId: result?.id ?? "",
                  organizationId: params.organizationId,
                })
              );
            //Member Page
            history.push(
              ApproverGroupAddRemoveMembersRoute.generate({
                approverGroupId: result?.approverGroups![0]?.id ?? "",
                organizationId: params.organizationId,
              })
            );
          }}
        >
          {({
            handleSubmit,
            handleChange,
            submitForm,
            setFieldValue,
            values,
            errors,
          }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={isMobile ? 2 : 8}>
                <Grid item xs={12} sm={6} lg={6}>
                  <Input
                    label={t("Name")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      placeholder: `E.g ${namePlaceholder}`,
                      name: "name",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        setName(e.currentTarget.value);
                      },
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Input
                    label={t("Identifier")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "externalId",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      helperText: t("Usually used for data integrations"),
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.variesByLocation}
                        onChange={e => {
                          setFieldValue("variesByLocation", e.target.checked);
                        }}
                        value={values.variesByLocation}
                        color="primary"
                        className={
                          errors && errors.variesByLocation
                            ? classes.checkboxError
                            : ""
                        }
                      />
                    }
                    label={t("Varies by location")}
                  />
                </Grid>
              </Grid>
              <ActionButtons
                submit={{ text: t("Save"), execute: submitForm }}
                cancel={{
                  text: t("Cancel"),
                  execute: () => {
                    const url = ApproverGroupsRoute.generate(params);
                    history.push(url);
                  },
                }}
              />
            </form>
          )}
        </Formik>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
  checkboxError: {
    color: theme.palette.error.main,
  },
}));
