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
import { useRouteParams } from "ui/routes/definition";
import { ApproverGroupCreateInput } from "graphql/server-types.gen";
//import { CreateApproverGroup } from "./graphql/create-approver-group.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  ApproverGroupsRoute,
  ApproverGroupAddAdminsRoute,
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

  // const [createApproverGroup] = useMutationBundle(CreateApproverGroup, {
  //   onError: error => {
  //     ShowErrors(error, openSnackbar);
  //   },
  // });

  const [approverGroup, setApproverGroup] = React.useState<
    ApproverGroupCreateInput
  >({
    orgId: params.organizationId,
    name: "",
    variesByLocation: false,
    description: undefined,
    locationId: undefined,
    approverGroupHeaderId: undefined,
  });

  //Mutations for Create Only
  const create = async (approverGroup: ApproverGroupCreateInput) => {
    // const result = await createApproverGroup({
    //   variables: {
    //     approverGroup: {
    //       ...approverGroup,
    //     },
    //   },
    // });
    // return result?.data?.approverGroup?.create?.id;
    console.log(approverGroup);
  };

  const initialValues = {
    name: approverGroup.name,
    externalId: approverGroup.variesByLocation,
    variesByLocation: approverGroup.variesByLocation ?? false,
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string()
          .nullable()
          .required(t("Identifier is required")),
        variesByLocation: Yup.boolean().required(),
      }),
    [t]
  );

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={initialValues}
        validationSchema={validateBasicDetails}
        onSubmit={async (data: any) => {
          setApproverGroup({
            ...approverGroup,
            name: data.name,
            variesByLocation: data.variesByLocation,
          });

          const id = await create(approverGroup);
          const viewParams = {
            ...params,
            approverGroupId: id,
          };
          //Location Page
          if (approverGroup.variesByLocation)
            history.push(ApproverGroupAddLocationsRoute.generate(viewParams));

          //Admin Page
          history.push(ApproverGroupAddAdminsRoute.generate(viewParams));
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
                  label={t("Approver name")}
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
                    //helperText: t("Usually used for data integrations"),
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Varies by location")}</Typography>
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
              submit={{ text: t("Next"), execute: submitForm }}
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
