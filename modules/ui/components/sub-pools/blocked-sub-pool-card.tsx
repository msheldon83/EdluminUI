import * as React from "react";
import { Grid, Typography, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import CheckIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import { useTranslation } from "react-i18next";
import ClearIcon from "@material-ui/icons/Clear";
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

  const [note, setNote] = React.useState<string | undefined>(
    replacementPoolMember.adminNote ?? ""
  );

  const [showEdit, setShowEdit] = React.useState<boolean>(false);

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
          {!replacementPoolMember.adminNote && !showEdit && (
            <TextButton
              className={classes.floatRight}
              onClick={() => setShowEdit(!showEdit)}
            >
              {t("Add Note")}
            </TextButton>
          )}
        </Can>
      </Grid>
      {showEdit ? (
        <Grid item xs={12} className={classes.position}>
          <div
            className={clsx({
              [classes.inline]: true,
              [classes.inputWidth]: true,
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
          <div className={classes.inline}>
            <div
              className={classes.iconHover}
              onClick={() => {
                const replacementPoolMemberInput: ReplacementPoolMemberUpdateInput = {
                  employeeId: replacementPoolMember.employeeId,
                  id: replacementPoolMember.id,
                  replacementPoolId: replacementPoolMember.replacementPoolId,
                  adminNote: note === "" ? null : note,
                };
                onAddNote(replacementPoolMemberInput);
                setShowEdit(!showEdit);
              }}
            >
              <CheckIcon className={classes.saveIcon} />
            </div>
            <div
              className={clsx({
                [classes.clearIcon]: true,
                [classes.iconHover]: true,
              })}
              onClick={() => {
                setShowEdit(!showEdit);
              }}
            >
              <ClearIcon className={classes.editIcon} />
            </div>
          </div>
        </Grid>
      ) : replacementPoolMember.adminNote ? (
        <Grid item xs={12} className={classes.position}>
          <div
            className={clsx({
              [classes.truncate]: true,
              [classes.textWidth]: true,
            })}
          >
            {note}
          </div>
          <div
            className={clsx({
              [classes.inline]: true,
              [classes.iconHover]: true,
            })}
            onClick={() => {
              setShowEdit(!showEdit);
            }}
          >
            <EditIcon className={classes.editIcon} />
          </div>
        </Grid>
      ) : (
        <></>
      )}
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
    width: "10%",
  },
  truncate: {
    paddingTop: theme.spacing(1),
    width: "90%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block",
    opacity: "0.7",
  },
  textWidth: {
    width: "90%",
    display: "inline-block",
    position: "relative",
  },
  inputWidth: {
    width: "90%",
    top: "-30px",
    display: "inline-block",
    position: "relative",
  },
  iconHover: {
    "&:hover": { cursor: "pointer" },
  },
  position: {
    position: "relative",
    maxHeight: "110px",
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
  clearIcon: {
    paddingTop: theme.spacing(2),
  },
  removeLink: {
    color: theme.customColors.darkRed,
  },
  userName: {
    float: "left",
  },
  floatRight: {
    float: "right",
    paddingRight: theme.spacing(1),
  },
}));
