import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { makeStyles, Tabs, Tab, Paper, Button } from "@material-ui/core";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Grid } from "@material-ui/core";
import {
  PositionTypeRoute,
  PositionTypeViewRoute,
  PositionTypeAddRoute,
} from "ui/routes/position-type";
import { useRouteParams } from "ui/routes/definition";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { useState } from "react";
import * as yup from "yup";
import { Formik } from "formik";
import { Link } from "react-router-dom";
import { AddBasicInfo } from "./components/add-basic-info";
import { Redirect, useHistory } from "react-router";

const steps = {
  basic: 0,
  settings: 1,
  replacement: 2,
  substitute: 3,
};

export const PositionTypeAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const history = useHistory();
  const params = useRouteParams(PositionTypeAddRoute);

  const [positionType, setPositionType] = React.useState({
    name: "",
    externalId: "",
  });
  const [step, setStep] = React.useState(steps.basic);
  const handleStepChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setStep(newValue);
  };

  const tabs = () => {
    return (
      <Paper square>
        <Tabs
          value={step}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleStepChange}
        >
          <Tab label={`1. ${t("Basic Info")}`} />
          <Tab label={`2. ${t("Settings")}`} />
          <Tab label={`3. ${t("Replacement")}`} />
          <Tab label={`4. ${t("Substitute")}`} />
        </Tabs>
      </Paper>
    );
  };

  const renderBasicInfoStep = () => {
    return (
      <AddBasicInfo
        positionType={positionType}
        onSubmit={(name: string, externalId: string) => {
          setPositionType({
            ...positionType,
            name: name,
            externalId: externalId,
          });
          setStep(steps.settings);
        }}
        onCancel={() => {
          const url = PositionTypeRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  return (
    <>
      <PageTitle title={t("Create new position type")} />
      {tabs()}
      {step === steps.basic && renderBasicInfoStep()}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    fontWeight: 500,
  },
}));
