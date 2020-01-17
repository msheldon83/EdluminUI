import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { PageHeader } from "ui/components/page-header";
import { GetAllEndorsementsWithinOrg } from "ui/pages/position-type/graphql/get-all-endorsements.gen";
import { useIsMobile } from "hooks";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDeferredState } from "hooks";
import { ReplacementCriteriaView } from "./components/replacement-criteria-view";
import { Qualified } from "./components/qualified";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { AvailableAttributes } from "./components/available-attributes";
import { GetQualifiedEmployeeCountsWithinOrg } from "./graphql/get-qualified-employee-counts.gen";

type Props = {
  mustHave: Attribute[];
  preferToHave: Attribute[];
  preferToNotHave: Attribute[];
  mustNotHave: Attribute[];
  availableAttributes?: Attribute[];
  positionName: string | undefined;
  orgId: string;
  positionId: string | undefined;
};

export type Attribute = {
  name: string;
  id: string;
  remove?: () => void;
  inherited?: boolean;
};

export const ReplacementCriteriaUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    // props.setSearchText(searchText);
  }, [searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  //Query qualified numbers
  const getQualifiedNumbers = useQueryBundle(
    GetQualifiedEmployeeCountsWithinOrg,
    {
      variables: {
        orgId: props.orgId,
        positionId: Number(props.positionId),
      },
    }
  );

  const getAllEndorsements = useQueryBundle(GetAllEndorsementsWithinOrg, {
    variables: { orgId: props.orgId, searchText: searchText },
  });

  if (
    getAllEndorsements.state === "LOADING" ||
    getQualifiedNumbers.state === "LOADING"
  ) {
    return <></>;
  }

  const qualifiedCounts =
    getQualifiedNumbers?.data?.position?.qualifiedEmployeeCounts;

  console.log(getQualifiedNumbers);

  const attributes =
    getAllEndorsements?.data?.orgRef_Endorsement?.all?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];

  return (
    <>
      <PageTitle title={t("Replacement Criteria")} withoutHeading={!isMobile} />
      <PageHeader
        text={t("Replacement Criteria - " + props.positionName)}
        label={t("Name")}
      />
      <Grid container className={classes.topPadding}>
        <Grid
          container
          item
          xs={6}
          spacing={2}
          className={classes.rightPadding}
        >
          <Grid item xs={12}>
            <Qualified
              highlyQualified={qualifiedCounts?.numFullyQualified}
              minimallyQualified={qualifiedCounts?.numMinimallyQualified}
              label={"thnig"}
            />
          </Grid>
          <ReplacementCriteriaView
            attributes={props?.mustHave}
            label={t("Substitutes must have")}
          />
          <ReplacementCriteriaView
            attributes={props?.preferToHave}
            label={t("Prefer that substitutes have")}
          />
          <ReplacementCriteriaView
            attributes={props?.preferToNotHave}
            label={t("Substitutes must not have")}
          />
          <ReplacementCriteriaView
            attributes={props?.mustNotHave}
            label={t("Prefer that substitutes not have")}
          />
        </Grid>
        <Grid container item xs={6} component="dl" spacing={2}>
          <Grid item xs={12}>
            <AvailableAttributes attributes={attributes} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  topPadding: {
    paddingTop: theme.spacing(4),
  },
  rightPadding: {
    paddingRight: theme.spacing(3),
  },
}));
