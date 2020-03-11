import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { LogDetail } from "./log-detail";
import { Section } from "../section";

type Props = {
  logDetails: {
    title?: string | null;
    subTitle?: string | null;
    actingUser: string;
    actualUser: string;
    createdUtc: string;
    moreDetail: boolean;
  }[];
};

export const ActivityLog: React.FC<Props> = props => {
  const classes = useStyles();

  const logDetails = props.logDetails;

  return (
    <Section>
      {logDetails.map((detail, i) => {
        return <LogDetail key={i} logDetail={detail} />;
      })}
    </Section>
  );
};

const useStyles = makeStyles(theme => ({}));
