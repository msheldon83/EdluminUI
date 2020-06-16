import * as React from "react";
import { Grid, Typography, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import CheckIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import {
  PermissionEnum,
  ReplacementPoolMember,
  ReplacementPoolMemberUpdateInput,
} from "graphql/server-types.gen";
import { Can } from "../auth/can";
import clsx from "clsx";
import { SubstituteLink } from "ui/components/links/people";

type Props = {
  replacementPoolMember: ReplacementPoolMember;
  onRemove: (member: ReplacementPoolMember) => void;
  onAddNote: (replacementPoolMember: ReplacementPoolMemberUpdateInput) => void;
  removePermission: PermissionEnum[];
  shaded: number;
};

export const BlockedSubPoolCard: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    replacementPoolMember,
    onRemove,
    onAddNote,
    removePermission,
    shaded,
  } = props;

  const [showFullNote, setShowFullNote] = React.useState<boolean>(false);

  const [note, setNote] = React.useState<string | undefined>(
    replacementPoolMember.adminNote ?? ""
  );

  return (
    <Grid
      item
      className={clsx({
        [classes.detail]: true,
        [classes.shadedRow]: shaded % 2 == 1,
      })}
      container
    >
      <Grid item xs={12}>
        <Typography className={classes.userName}>
          <SubstituteLink
            orgUserId={replacementPoolMember.employeeId}
            color="black"
          >
            {replacementPoolMember?.employee?.firstName ?? ""}{" "}
            {replacementPoolMember?.employee?.lastName ?? ""}
          </SubstituteLink>
        </Typography>
        <Can do={removePermission}>
          <TextButton
            className={clsx({
              [classes.removeLink]: true,
              [classes.floatRight]: true,
            })}
            onClick={() => onRemove(replacementPoolMember)}
          >
            {t("Remove")}
          </TextButton>
          {!replacementPoolMember.adminNote ? (
            <TextButton
              className={classes.floatRight}
              onClick={() => setShowFullNote(!showFullNote)}
            >
              {t("Add Note")}
            </TextButton>
          ) : (
            <>
              <div
                className={classes.floatRight}
                onClick={() => setShowFullNote(!showFullNote)}
              >
                <EditIcon className={classes.center} />
              </div>
            </>
          )}
        </Can>
      </Grid>
      <Grid item xs={12}>
        {!showFullNote ? (
          <div className={classes.truncate}>{note}</div>
        ) : (
          <>
            <div
              className={clsx({
                [classes.inline]: true,
                [classes.textWidth]: true,
              })}
            >
              <TextField
                //multiline={true}
                rows="1"
                value={note}
                fullWidth={true}
                variant="outlined"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNote(e.target.value);
                }}
              />
            </div>
            <div
              className={clsx({
                [classes.inline]: true,
                [classes.iconWidth]: true,
              })}
              onClick={() => {
                const replacementPoolMemberInput: ReplacementPoolMemberUpdateInput = {
                  employeeId: replacementPoolMember.employeeId,
                  id: replacementPoolMember.id,
                  replacementPoolId: replacementPoolMember.replacementPoolId,
                  adminNote: note === "" ? undefined : note,
                };
                onAddNote(replacementPoolMemberInput);
              }}
            >
              <CheckIcon className={classes.center} />
            </div>
          </>
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  detail: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    "@media print": {
      paddingLeft: theme.spacing(),
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
    },
  },
  inline: {
    display: "inline-block",
  },
  truncate: {
    paddingTop: theme.spacing(1),
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  textWidth: {
    width: "90%",
  },
  iconWidth: {
    width: "10%",
    height: "50px",
    position: "relative",
  },
  center: {
    top: "15px",
    width: "100%",
    position: "relative",
  },
  removeLink: {
    color: theme.customColors.darkRed,
  },
  userName: {
    float: "left",
  },
  floatRight: {
    float: "right",
  },
}));
