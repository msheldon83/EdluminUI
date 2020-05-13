import * as React from "react";
import { ReportChartDefinition } from "../types";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { Bar } from "react-chartjs-2";

type Props = {
  reportChartDefinition: ReportChartDefinition | undefined;
  isLoading: boolean;
};

export const ReportChart: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { reportChartDefinition, isLoading } = props;

  console.log(props.reportChartDefinition);

  if (!reportChartDefinition) {
    // TODO: Loading view
    return <></>;
  }

  const data = {
    labels: reportChartDefinition.data.againstRawData,
    datasets: [
      {
        label: "My First dataset",
        // backgroundColor: "rgba(255,99,132,0.2)",
        // borderColor: "rgba(255,99,132,1)",
        // borderWidth: 1,
        // hoverBackgroundColor: "rgba(255,99,132,0.4)",
        // hoverBorderColor: "rgba(255,99,132,1)",
        data: reportChartDefinition.data.graphData[0].rawData[0],
      },
    ],
  };

  return (
    <div>
      <Bar
        data={data}
        height={400}
        options={{
          maintainAspectRatio: false,
        }}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({}));
