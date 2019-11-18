import * as React from "react";
import { VacancyQualification } from "graphql/server-types.gen";

type Props = {
  qualified: VacancyQualification;
};

export const QualifiedIcon: React.FC<Props> = props => {
  switch (props.qualified) {
    case VacancyQualification.Fully:
      return <img src={require("ui/icons/qualified-3.svg")} />;
    case VacancyQualification.Minimally:
      return <img src={require("ui/icons/qualified-1.svg")} />;
    case VacancyQualification.NotQualified:
      return <img src={require("ui/icons/not-qualified.svg")} />;
  }
};
