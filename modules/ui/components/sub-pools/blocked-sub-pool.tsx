import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { BlockedSubPoolCard } from "./blocked-sub-pool-card";
import {
  PermissionEnum,
  ReplacementPoolMemberUpdateInput,
} from "graphql/server-types.gen";
import { BlockedPoolMember } from "./types";

type Props = {
  title: string;
  replacementPoolMembers: BlockedPoolMember[] | null;
  onRemove: (member: BlockedPoolMember) => void;
  onAddNote: (replacementPoolMember: ReplacementPoolMemberUpdateInput) => void;
  removePermission: PermissionEnum[];
};

export const BlockedSubPool: React.FC<Props> = props => {
  const { t } = useTranslation();

  const {
    title,
    replacementPoolMembers,
    onRemove,
    onAddNote,
    removePermission,
  } = props;

  return (
    <>
      <Section>
        <SectionHeader title={title} />
        <Grid
          container
          justify="space-between"
          alignItems="center"
          direction="row"
        >
          {replacementPoolMembers?.length === 0 ? (
            <Grid item xs={12}>
              <Typography>{t("Not Defined")}</Typography>
            </Grid>
          ) : (
            replacementPoolMembers?.map((member, i) => {
              return (
                <BlockedSubPoolCard
                  onAddNote={onAddNote}
                  replacementPoolMember={member}
                  removePermission={removePermission}
                  onRemove={onRemove}
                  shaded={i}
                  key={i}
                />
              );
            })
          )}
        </Grid>
      </Section>
    </>
  );
};
