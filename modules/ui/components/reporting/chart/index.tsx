import * as React from "react";
import { ReportChartDefinition, GraphType } from "../types";
import { makeStyles, CircularProgress, Theme } from "@material-ui/core";
import { Bar, ChartData } from "react-chartjs-2";
import {
  ChartData as ChartJsChartData,
  ChartType as ChartJsChartType,
  ChartLegendLabelItem,
} from "chart.js";
import { flatMap } from "lodash-es";
import { hexToRgb } from "ui/components/color-helpers";

type Props = {
  reportChartDefinition: ReportChartDefinition | undefined;
  isLoading: boolean;
};

export const ReportChart: React.FC<Props> = props => {
  const classes = useStyles(props);
  const { reportChartDefinition, isLoading } = props;

  // Every graph displayed on the chart will have the same
  // yAxisID so everyone shares the same y axis configuration
  const yAxisID = "red-rover-graph";
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
          // Convert our Graph Type into something Chart JS understands
          const graphType = getChartJsGraphType(g.type);
          // Giving each item in a Stacked Bar graph the same "stack" value
          // results in those series being stacked together
          const stackId =
            g.type === GraphType.StackedBar ? `stack-${graphIndex}` : undefined;
          return g.series.map((s, seriesIndex) => {
            colorIndex = colorIndex + 1;
            return {
              label: s.displayName,
              type: graphType,
              data: graphData[seriesIndex],
              fill: true,
              yAxisID,
              stack: stackId,
              borderWidth: 1,
              backgroundColor: hexToRgb(possibleColors[colorIndex], 0.8),
              borderColor: hexToRgb(possibleColors[colorIndex], 1),
              hoverBackgroundColor: hexToRgb(possibleColors[colorIndex], 0.9),
              hoverBorderColor: hexToRgb(possibleColors[colorIndex], 1),
            };
          });
        })
      ),
    };
  }, [reportChartDefinition]);

  return (
    <div className={classes.container}>
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
          responsive: true,
          legend: {
            align: "start",
            display: true,
            position: "top",
            labels: {
              boxWidth: 10,
              fontSize: 14,
              padding: 20,
              generateLabels: chart => {
                // Taking over the construction of the legend label
                // objects in order to round the edges of the boxes
                return (
                  chart.config.data?.datasets?.map(d => {
                    return {
                      text: d.label,
                      fillStyle: d.borderColor,
                      lineCap: "round",
                      lineJoin: "round",
                      strokeStyle: d.borderColor,
                    } as ChartLegendLabelItem;
                  }) ?? []
                );
              },
            },
          },
          scales: {
            yAxes: [
              {
                type: "linear",
                display: true,
                position: "left",
                id: yAxisID,
                gridLines: {
                  display: true,
                },
                stacked: !!data.datasets?.find(d => d.stack),
              },
            ],
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
              },
            ],
          },
          tooltips: {
            displayColors: true,
            xPadding: 10,
            yPadding: 10,
            mode: "index",
            backgroundColor: "#FFFFFF",
            titleFontColor: "#000000",
            titleMarginBottom: 10,
            bodyFontColor: "#000000",
            bodySpacing: 10,
            borderColor: "#E5E5E5",
            borderWidth: 2,
            caretSize: 10,
          },
        }}
        plugins={[
          {
            beforeInit: function(chart: any) {
              chart.legend.afterFit = function() {
                // Only way to add padding between the
                // legend and the content of the chart
                this.height = this.height + 10;
              };
            },
          },
        ]}
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

// TODO: Add support to the Report Definition on the
// backend to accept a Series string that includes a hex
// color. For now we have full control over how complicated
// our charts are going to be, so supporting up to 6 series
// should do it.
const possibleColors = [
  "#FF5555",
  "#3d4ed7",
  "#ffcc01",
  "#d8d8d8",
  "#4caf50",
  "#B80FD5",
];
