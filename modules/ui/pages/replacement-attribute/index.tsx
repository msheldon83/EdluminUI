import { Grid, makeStyles, Checkbox } from "@material-ui/core";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { compact } from "lodash-es";
import { EditableTable } from "ui/components/editable-table";
import { PageTitle } from "ui/components/page-title";
import {
  EndorsementCreateInput,
  Endorsement,
  EndorsementUpdateInput,
} from "graphql/server-types.gen";
import { Column } from "material-table";
import { useSnackbar } from "hooks/use-snackbar";
import { CreateReplacementEndorsement } from "./graphql/create.gen";
import { UpdateReplacementEndorsement } from "./graphql/update.gen";
import { DeleteReplacementEndorsement } from "./graphql/delete.gen";
import { ReplacementAttributeIndexRoute } from "ui/routes/replacement-attribute";
import { GetAllReplacementEndorsementsWithinOrg } from "./graphql/get-replacement-endorsements.gen";
import { useRouteParams } from "ui/routes/definition";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";

type Props = {};

export const ReplacementAttribute: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [createReplacementEndorsement] = useMutationBundle(
    CreateReplacementEndorsement
  );
  const [updateReplacementEndorsement] = useMutationBundle(
    UpdateReplacementEndorsement
  );
  const params = useRouteParams(ReplacementAttributeIndexRoute);
  const { openSnackbar } = useSnackbar();
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getReplacementEndorsements = useQueryBundle(
    GetAllReplacementEndorsementsWithinOrg,
    {
      variables: { orgId: params.organizationId, includeExpired },
    }
  );
  const [deleteReplacementEndorsementMutation] = useMutationBundle(
    DeleteReplacementEndorsement,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );
  const deleteReplacementEndorsement = (endorsementId: string) => {
    return deleteReplacementEndorsementMutation({
      variables: {
        endorsementId: Number(endorsementId),
      },
    });
  };

  const validateReplacementEndorsement = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
        description: Yup.string().nullable(),
        expires: Yup.boolean().required(t("Expiration is required")),
      }),
    [t]
  );

  const [replacementEndorsement] = React.useState<EndorsementCreateInput>({
    orgId: Number(params.organizationId),
    name: "",
    externalId: null,
    description: "",
    expires: false,
  });

  const create = async (replacementEndorsement: EndorsementCreateInput) => {
    validateReplacementEndorsement
      .validate(replacementEndorsement, { abortEarly: false })
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await createReplacementEndorsement({
      variables: {
        replacementEndorsement,
      },
    });
  };

  const update = async (replacementEndorsement: EndorsementUpdateInput) => {
    validateReplacementEndorsement
      .validate(replacementEndorsement, { abortEarly: false })
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await updateReplacementEndorsement({
      variables: {
        replacementEndorsement,
      },
    });
  };

  const columns: Column<
    Pick<
      Endorsement,
      | "id"
      | "name"
      | "externalId"
      | "expires"
      | "description"
      | "rowVersion"
      | "expired"
    >
  >[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      editable: "always",
    },
    {
      title: t("External Id"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("May Have Exiration"),
      field: "expires",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      editComponent: o => (
        <Checkbox
          color="primary"
          value={o.expires}
          checked={o.expires}
          onChange={e => o.expires == e.target.value}
        />
      ),
    },
    {
      title: t("Description"),
      field: "description",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
  ];

  if (getReplacementEndorsements.state === "LOADING") {
    return <></>;
  }

  const replacementEndorsements = compact(
    getReplacementEndorsements?.data?.orgRef_Endorsement?.all ?? []
  );
  const mappedData = replacementEndorsements.map(o => ({
    ...o,
    description: o.description?.toString(),
    externalId: o.externalId?.toString(),
  }));
  const replacementEndorsementsCount = replacementEndorsements.length;

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Replacement Attributes")} />
        </Grid>
      </Grid>
      <EditableTable
        title={`${replacementEndorsementsCount} ${t("Replacement Attributes")}`}
        columns={columns}
        data={mappedData}
        onRowAdd={async newData => {
          console.log(newData);
          const newReplacementEndorsement = {
            ...replacementEndorsement,
            name: newData.name,
            externalId:
              newData.externalId && newData.externalId.trim().length === 0
                ? null
                : newData.externalId,
            expires: newData.expires,
            description:
              newData.description && newData.description.trim().length === 0
                ? null
                : newData.description,
          };
          await create(newReplacementEndorsement);
          getReplacementEndorsements.refetch();
        }}
        onRowUpdate={async newData => {
          console.log(newData);
          const updateReplacementEndorsement = {
            id: Number(newData.id),
            rowVersion: newData.rowVersion,
            name: newData.name,
            externalId:
              newData.externalId && newData.externalId.trim().length === 0
                ? null
                : newData.externalId,
            expires: newData.expires,
            description:
              newData.description && newData.description.trim().length === 0
                ? null
                : newData.description,
          };
          await update(updateReplacementEndorsement);
          getReplacementEndorsements.refetch();
        }}
        onRowDelete={async oldData => {
          await deleteReplacementEndorsement(String(oldData.id));
          getReplacementEndorsements.refetch();
        }}
        options={{
          search: true,
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
  checkbox: {
    disabled: "true",
  },
}));
