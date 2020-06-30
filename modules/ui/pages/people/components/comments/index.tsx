import * as React from "react";
import { CommentView } from "./comment-view";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "ui/components/section-header";

type Props = { orgId: string; comments?: Comment[] | null | undefined };

export const Comments: React.FC<Props> = props => {
  const { t } = useTranslation();

  return (
    <Section>
      <SectionHeader title={t("Comments")} />
      <CommentView />
    </Section>
  );
};
