import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
  ClickAwayListener,
  Fade,
  IconButton,
  Link,
  List,
  ListItemText,
  makeStyles,
  Popper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import MailIcon from "@material-ui/icons/Mail";
import { AccountCircleOutlined } from "@material-ui/icons";
import { PaginationInfo } from "graphql/hooks";
import { Can } from "ui/components/auth/can";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { AccessIcon } from "./access-icon";
import { TablePerson } from "../types";
import { ShadowIndicator } from "ui/components/shadow-indicator";
import { compact } from "lodash-es";
import clsx from "clsx";

type ToolbarProps = {
  rowCount: number;
  numberSelected: number;
  inviteSelected: () => void;
};

const PeopleToolbar: React.FC<ToolbarProps> = ({
  rowCount,
  numberSelected,
  inviteSelected,
}) => {
  const { t } = useTranslation();
  const classes = useToolbarStyles();

  return (
    <Toolbar className={clsx({ [classes.selected]: numberSelected > 0 })}>
      {numberSelected > 0 ? (
        <>
          <Typography className={classes.title} variant="subtitle1">
            {numberSelected} {t("selected")}
          </Typography>
          <Tooltip title="Invite selected people">
            <IconButton aria-label="invite-all" onClick={inviteSelected}>
              <MailIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Typography className={classes.title} variant="h5">
          {rowCount} {rowCount == 1 ? t("Person") : t("People")}
        </Typography>
      )}
    </Toolbar>
  );
};

const useToolbarStyles = makeStyles(theme => ({
  title: {
    flex: "1 1 100%",
    padding: theme.spacing(1),
  },
  selected: {
    background: theme.customColors.lightGray,
    padding: theme.spacing(1),
  },
}));

type HeadProps = {
  notSetupUserCount: number;
  extraHeaders: string[];
  numberSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const PeopleTableHead: React.FC<HeadProps> = ({
  notSetupUserCount,
  extraHeaders,
  numberSelected,
  onSelectAllClick,
}) => {
  const { t } = useTranslation();

  return (
    <TableHead>
      <TableRow>
        <Can do={[PermissionEnum.OrgUserInvite]}>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={
                numberSelected > 0 && numberSelected < notSetupUserCount
              }
              checked={
                notSetupUserCount > 0 && numberSelected === notSetupUserCount
              }
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": t("select all people") }}
            />
          </TableCell>
        </Can>
        <TableCell />
        <TableCell>{t("Name")}</TableCell>
        <TableCell>{t("Username")}</TableCell>
        <TableCell>{t("Identifier")}</TableCell>
        {extraHeaders.map((headerText, i) => (
          <TableCell key={i}>{headerText}</TableCell>
        ))}
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
  );
};

type RowProps = {
  person: TablePerson;
  extraColumns: ((person: TablePerson) => React.ReactChild)[];
  selected: boolean;
  toUserPage: () => void;
  onSelectClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const PeopleRow: React.FC<RowProps> = ({
  person,
  extraColumns,
  selected,
  toUserPage,
  onSelectClick,
}) => {
  const classes = useRowStyles();

  return (
    <TableRow className={classes.tableRow} onClick={toUserPage}>
      <Can do={[PermissionEnum.OrgUserInvite]}>
        <TableCell padding="checkbox">
          {!person.accountSetup && (
            <Checkbox
              checked={selected}
              onClick={event => event.stopPropagation()}
              onChange={onSelectClick}
            />
          )}
        </TableCell>
      </Can>
      <TableCell>
        <div className={classes.account}>
          <AccountCircleOutlined />
          <AccessIcon
            inviteSent={person.inviteSent}
            accountSetup={person.accountSetup}
            inviteSentAtUtc={person.inviteSentAtUtc}
            inviteRequestedAtUtc={person.invitationRequestedAtUtc}
          />
        </div>
      </TableCell>
      <TableCell>
        <Typography>
          {person.lastName}, {person.firstName}
        </Typography>
        <ShadowIndicator
          isShadow={person.isShadowRecord}
          orgName={person.shadowFromOrgName}
        />
      </TableCell>
      <TableCell>{person.userName}</TableCell>
      <TableCell>{person.externalId}</TableCell>
      {extraColumns.map((column, i) => (
        <TableCell key={i}>{column(person)}</TableCell>
      ))}
      <TableCell>
        <Link
          href={`mailto:${person.email}`}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
          }}
          color="secondary"
        >
          <MailIcon />
        </Link>
      </TableCell>
    </TableRow>
  );
};

const useRowStyles = makeStyles(theme => ({
  account: {
    display: "flex",
    alignItems: "center",
  },
  tableRow: {
    borderTop: `1px solid ${theme.customColors.sectionBorder}`,
    cursor: "pointer",

    "&:nth-child(even)": {
      background: theme.customColors.lightGray,
    },

    "&:hover": {
      background: theme.customColors.lightGray,
    },
  },
}));

type BaseProps = {
  pagination: PaginationInfo;
  extraColumns: {
    header: string;
    row: (person: TablePerson) => React.ReactChild;
  }[];
  data: TablePerson[];
  inviteSelected: (ids: string[]) => void;
  toUserPage: (id: string) => void;
};

const BaseTable: React.FC<BaseProps> = ({
  pagination,
  extraColumns,
  data,
  inviteSelected,
  toUserPage,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<string[]>([]);

  const handleSelectClick = (id: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) =>
    setSelected(
      event.target.checked
        ? selected.concat([id])
        : selected.filter(i => i != id)
    );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(
      event.target.checked
        ? data.filter(d => !d.accountSetup).map(n => n.id)
        : []
    );

  return (
    <>
      <PeopleToolbar
        rowCount={pagination.totalCount}
        numberSelected={selected.length}
        inviteSelected={() =>
          inviteSelected(
            compact(selected.map(s => data.find(d => d.id == s)?.userId))
          )
        }
      />
      <PaginationControls pagination={pagination} />
      <TableContainer>
        <Table>
          <PeopleTableHead
            notSetupUserCount={data.filter(e => !e.accountSetup).length}
            numberSelected={selected.length}
            onSelectAllClick={handleSelectAllClick}
            extraHeaders={extraColumns.map(c => c.header)}
          />
          <TableBody>
            {data.map(person => (
              <PeopleRow
                key={person.id}
                person={person}
                extraColumns={extraColumns.map(c => c.row)}
                selected={selected.includes(person.id)}
                onSelectClick={handleSelectClick(person.id)}
                toUserPage={() => toUserPage(person.id)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PaginationControls pagination={pagination} />
    </>
  );
};

type ButtonPopperProps = {
  id: string;
  objectName: string;
  objects: { name: string }[];
};

const ButtonPopper: React.FC<ButtonPopperProps> = ({
  id,
  objectName,
  objects,
}) => {
  const classes = useButtonPopperStyles();
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const handleToggle = (event?: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor || !event ? null : event.currentTarget);
    if (event) event.stopPropagation();
  };
  const isOpen = Boolean(anchor);

  return (
    <>
      <Button id={id} onClick={handleToggle}>
        {`${objects.length} ${objectName}`}
      </Button>
      <Popper transition open={isOpen} anchorEl={anchor} placement="bottom-end">
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onClick"
                onClickAway={() => handleToggle()}
              >
                <List className={classes.paper}>
                  {objects.map((l, index) => (
                    <ListItemText key={index}>{l?.name}</ListItemText>
                  ))}
                </List>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const useButtonPopperStyles = makeStyles(theme => ({
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));

type MaybeManyCellProps = {
  allIf?: boolean;
  objects?: { name: string }[];
  objectName: string;
  objectType: string;
  personId: string;
};

function MaybeManyCell({
  allIf,
  objects,
  objectName,
  objectType,
  personId,
}: MaybeManyCellProps) {
  const { t } = useTranslation();
  if (allIf) return <> {t("All")} </>;
  if (!objects || objects.length < 1) return <> {t("None")} </>;
  if (objects.length === 1) return <> {objects[0].name} </>;
  return (
    <ButtonPopper
      id={`${objectType}-${personId}`}
      objectName={objectName}
      objects={objects}
    />
  );
}

type InternalProps = {
  pagination: PaginationInfo;
  data: TablePerson[];
  inviteSelected: (ids: string[]) => void;
  toUserPage: (id: string) => void;
};

const AllTable: React.FC<InternalProps> = props => {
  const { t } = useTranslation();
  return (
    <BaseTable
      extraColumns={[{ header: t("Role"), row: person => person.roles }]}
      {...props}
    />
  );
};

const AdminTable: React.FC<InternalProps> = props => {
  const { t } = useTranslation();
  return (
    <BaseTable
      extraColumns={[
        {
          header: t("Manages position type"),
          row: person => (
            <MaybeManyCell
              allIf={person.allPositionTypeIdsInScope || person.isSuperUser}
              objects={person.adminPositionTypes}
              objectName={t("Position Types Managed")}
              objectType={"posTypesManaged"}
              personId={person.id}
            />
          ),
        },
        {
          header: t("Manages location"),
          row: person => (
            <MaybeManyCell
              allIf={person.allLocationIdsInScope || person.isSuperUser}
              objects={person.adminLocations}
              objectName={t("Locations Managed")}
              objectType={"locationsManaged"}
              personId={person.id}
            />
          ),
        },
      ]}
      {...props}
    />
  );
};

const EmployeeTable: React.FC<InternalProps> = props => {
  const { t } = useTranslation();
  return (
    <BaseTable
      extraColumns={[
        {
          header: t("Position Type"),
          row: person => person.positionType ?? "",
        },
        {
          header: t("Location"),
          row: person => (
            <MaybeManyCell
              objects={person.locations}
              objectName={t("Locations")}
              objectType={"locations"}
              personId={person.id}
            />
          ),
        },
      ]}
      {...props}
    />
  );
};

const SubTable: React.FC<InternalProps> = props => {
  const { t } = useTranslation();

  return (
    <BaseTable
      extraColumns={[
        {
          header: t("Attributes"),
          row: person => (
            <MaybeManyCell
              objects={person.endorsements}
              objectName={t("Attributes")}
              objectType={"endorsements"}
              personId={person.id}
            />
          ),
        },
      ]}
      {...props}
    />
  );
};

type Props = {
  pagination: PaginationInfo;
  data: TablePerson[];
  inviteSelected: (ids: string[]) => void;
  role:
    | OrgUserRole.Administrator
    | OrgUserRole.Employee
    | OrgUserRole.ReplacementEmployee
    | null;
  toUserPage: (id: string) => void;
};

export const PeopleTable: React.FC<Props> = ({ role, ...props }) => {
  switch (role) {
    case OrgUserRole.Administrator:
      return <AdminTable {...props} />;
    case OrgUserRole.Employee:
      return <EmployeeTable {...props} />;
    case OrgUserRole.ReplacementEmployee:
      return <SubTable {...props} />;
  }
  return <AllTable {...props} />;
};
