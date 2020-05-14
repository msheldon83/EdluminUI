import * as React from "react";
import { ReportChartDefinition, GraphType } from "../types";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { Bar, ChartData } from "react-chartjs-2";
import {
  ChartData as ChartJsChartData,
  ChartType as ChartJsChartType,
} from "chart.js";
import { flatMap } from "lodash-es";
import { hexToRgb } from "ui/components/color-helpers";

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

  let colorIndex = -1;
  const data: ChartData<ChartJsChartData> = {
    labels: reportChartDefinition.data.againstRawData,
    datasets: flatMap(
      reportChartDefinition.metadata.chart?.graphs.map((g, graphIndex) => {
        const graphData =
          reportChartDefinition.data.graphData[graphIndex].rawData;
        const graphType = getChartJsGraphType(g.type);
        const graphId = `graph-${graphIndex}`;
        return g.series.map((s, seriesIndex) => {
          colorIndex = colorIndex + 1;
          return {
            label: s.displayName,
            type: graphType,
            data: graphData[seriesIndex],
            yAxisID: graphId,
            stack: "test",

            borderWidth: 1,
            backgroundColor: hexToRgb(possibleColors[colorIndex], 0.2),
            borderColor: hexToRgb(possibleColors[colorIndex], 1),
            hoverBackgroundColor: hexToRgb(possibleColors[colorIndex], 0.4),
            hoverBorderColor: hexToRgb(possibleColors[colorIndex], 1),
          };
        });
      })
    ),
  };

  return (
    <div className={classes.container}>
      <Bar
        data={data}
        height={400}
        options={{
          maintainAspectRatio: false,
          legend: {
            align: "start",
            display: true,
            position: "top",
          },
          responsive: true,
          scales: {
            yAxes: [
              {
                type: "linear",
                display: true,
                position: "left",
                id: "graph-0",
                gridLines: {
                  display: true,
                },
                stacked: true,
              },
            ],
          },
        }}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3),
    borderTopWidth: 0,
    borderBottomWidth: theme.typography.pxToRem(1),
    borderLeftWidth: theme.typography.pxToRem(1),
    borderRightWidth: theme.typography.pxToRem(1),
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    backgroundColor: theme.customColors.white,
  },
}));

const getChartJsGraphType = (type: GraphType): ChartJsChartType => {
  switch (type) {
    case GraphType.Bar:
    case GraphType.StackedBar:
      return "bar";
    case GraphType.Line:
      return "line";
    case GraphType.Pie:
      return "pie";
    default:
      return "bar";
  }
};

const possibleColors = [
  "#FF5555",
  "#3d4ed7",
  "#ffcc01",
  "#d8d8d8",
  "#4caf50",
  "#B80FD5",
];
