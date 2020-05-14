import * as React from "react";
import { ReportChartDefinition, GraphType } from "../types";
import { makeStyles, CircularProgress, Theme } from "@material-ui/core";
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
  className?: string;
};

export const ReportChart: React.FC<Props> = props => {
  const classes = useStyles(props);
  const { reportChartDefinition, isLoading, className } = props;

  const graphId = "red-rover-graph";
  const data: ChartData<ChartJsChartData> = React.useMemo(() => {
    if (!reportChartDefinition) {
      return {
        labels: [],
        datasets: [],
      };
    }

    let colorIndex = -1;
    return {
      labels: reportChartDefinition.data.againstRawData,
      datasets: flatMap(
        reportChartDefinition.metadata.chart?.graphs.map((g, graphIndex) => {
          const graphData =
            reportChartDefinition.data.graphData[graphIndex].rawData;
          const graphType = getChartJsGraphType(g.type);
          const stackId =
            g.type === GraphType.StackedBar ? `stack-${graphIndex}` : undefined;
          return g.series.map((s, seriesIndex) => {
            colorIndex = colorIndex + 1;
            return {
              label: s.displayName,
              type: graphType,
              data: graphData[seriesIndex],
              yAxisID: graphId,
              stack: stackId,
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
  }, [reportChartDefinition]);

  return (
    <div
      className={
        className ? `${classes.container} ${className}` : classes.container
      }
    >
      {isLoading && (
        <div className={classes.overlay}>
          <CircularProgress />
        </div>
      )}
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
                id: graphId,
                gridLines: {
                  display: true,
                },
                stacked: !!data.datasets?.find(d => d.stack),
              },
            ],
          },
        }}
      />
    </div>
  );
};

const useStyles = makeStyles<Theme, Props>(theme => ({
  container: {
    padding: theme.spacing(3),
    borderTopWidth: theme.typography.pxToRem(1),
    borderLeftWidth: theme.typography.pxToRem(1),
    borderRightWidth: theme.typography.pxToRem(1),
    borderBottomWidth: 0,
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    backgroundColor: theme.customColors.white,
    borderTopLeftRadius: "0.25rem",
    borderTopRightRadius: "0.25rem",
    opacity: props => (props.isLoading ? 0.5 : 1),
  },
  overlay: {
    position: "relative",
    top: theme.typography.pxToRem(100),
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    height: 0,
    zIndex: 1,
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
