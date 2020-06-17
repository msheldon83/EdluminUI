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

  const [showEdit, setShowEdit] = React.useState<boolean>(
    replacementPoolMember.adminNote ? true : false
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
          {!replacementPoolMember.adminNote && (
            <TextButton
              className={classes.floatRight}
              onClick={() => setShowFullNote(!showFullNote)}
            >
              {t("Add Note")}
            </TextButton>
          )}
        </Can>
      </Grid>
      <Grid item xs={12}>
        {!showFullNote && showEdit && replacementPoolMember.adminNote ? (
          <>
            <div
              className={clsx({
                [classes.inline]: true,
                [classes.truncate]: true,
                [classes.textWidth]: true,
              })}
            >
              {note}
            </div>

            <div
              className={clsx({
                [classes.inline]: true,
                [classes.iconWidth]: true,
              })}
              onClick={() => {
                setShowFullNote(!showFullNote);
                setShowEdit(!showEdit);
              }}
            >
              <EditIcon className={classes.editIcon} />
            </div>
          </>
        ) : !showFullNote ? (
          <></>
        ) : (
          <>
            <div
              className={clsx({
                [classes.inline]: true,
                [classes.textWidth]: true,
              })}
            >
              <TextField
                rows="1"
                value={note}
                multiline={true}
                placeholder={t("Notes")}
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
                  adminNote: note === "" ? null : note,
                };

                onAddNote(replacementPoolMemberInput);
                setShowFullNote(!showFullNote);
                setShowEdit(!showEdit);
              }}
            >
              <CheckIcon className={classes.saveIcon} />
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
    width: "90%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    opacity: "0.7",
  },
  textWidth: {
    width: "90%",
  },
  iconWidth: {
    width: "10%",
    position: "relative",
    "&:hover": { cursor: "pointer" },
  },
  saveIcon: {
    top: "15px",
    width: "100%",
    position: "relative",
  },
  editIcon: {
    width: "100%",
    position: "relative",
    height: "20px",
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
