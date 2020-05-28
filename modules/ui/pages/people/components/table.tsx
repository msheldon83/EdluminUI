import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
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
    <Toolbar>
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
  },
}));

type HeadProps = {
  rowCount: number;
  extraHeaders: string[];
  numberSelected: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const PeopleTableHead: React.FC<HeadProps> = ({
  rowCount,
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
              indeterminate={numberSelected > 0 && numberSelected < rowCount}
              checked={rowCount > 0 && numberSelected === rowCount}
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
          <Checkbox checked={selected} onChange={onSelectClick} />
        </TableCell>
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
          {person.lastName}, {person.firstName}
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
      </Can>
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

    "&:nth-child(even)": {
      background: theme.customColors.lightGray,
    },

    "&:hover": {
      background: theme.customColors.gray,
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
    setSelected(event.target.checked ? data.map(n => n.id) : []);

  return (
    <>
      <PeopleToolbar
        rowCount={data.length}
        numberSelected={selected.length}
        inviteSelected={() => inviteSelected(selected)}
      />
      <PaginationControls pagination={pagination} />
      <TableContainer>
        <PeopleTableHead
          rowCount={data.length}
          numberSelected={selected.length}
          onSelectAllClick={handleSelectAllClick}
          extraHeaders={extraColumns.map(c => c.header)}
        />
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
      </TableContainer>
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
  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : event.currentTarget);
    event.stopPropagation();
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
            <List className={classes.paper}>
              {objects.map((l, index) => (
                <ListItemText key={index}>{l?.name}</ListItemText>
              ))}
            </List>
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
              allIf={person.allLocationIdsInScope || person.isSuperUser}
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
