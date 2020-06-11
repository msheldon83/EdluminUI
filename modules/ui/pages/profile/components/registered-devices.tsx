import * as React from "react";
import { useTranslation } from "react-i18next";
import { UserDevice } from "graphql/server-types.gen";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Typography, withStyles, createStyles, Theme } from "@material-ui/core";
import { getDisplayName } from "ui/components/enumHelpers";

type Props = {
  mobileDevices: Pick<
    UserDevice,
    | "deviceId"
    | "mobileDeviceTypeId"
    | "operatingSystemVersion"
    | "softwareVersion"
  >[];
};

export const RegisteredDevices: React.FC<Props> = props => {
  const { t } = useTranslation();

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="h5">
                  {t("Registered Mobile Devices")}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <StyledTableCell>{t("Device Id")}</StyledTableCell>
              <StyledTableCell>{t("Type")}</StyledTableCell>
              <StyledTableCell>{t("Operating System Version")}</StyledTableCell>
              <StyledTableCell>{t("Software Version")}</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.mobileDevices.map((device, i) => {
              return (
                <StyledTableRow key={i}>
                  <TableCell>{device.deviceId}</TableCell>
                  <TableCell>
                    {getDisplayName(
                      "mobileDevice",
                      device.mobileDeviceTypeId,
                      t
                    ) ?? ""}
                  </TableCell>
                  <TableCell>{device.operatingSystemVersion}</TableCell>
                  <TableCell>{device.softwareVersion}</TableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderTop: `1px solid ${theme.customColors.sectionBorder}`,
      "&:nth-of-type(even)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      color: `${theme.palette.secondary.main} !important`,
      fontSize: 14,
      fontWeight: "bold",
      paddingTop: 0,
    },
    body: {
      color: `${theme.palette.secondary.main} !important`,
    },
  })
)(TableCell);
