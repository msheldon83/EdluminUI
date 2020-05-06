import * as React from "react";
import { List } from "react-virtualized";
import { AbsVacLink } from "ui/components/links/abs-vac";

export type LinkProps = {
  id: string;
  type: "absence" | "vacancy";
};

type RowProps = {
  index: number;
  key: string;
  style: React.CSSProperties;
};

const row: (links: LinkProps[]) => React.FC<RowProps> = links => ({
  index,
  key,
  style,
}) => {
  return (
    <div key={key} style={style}>
      <AbsVacLink absVacId={links[index].id} absVacType={links[index].type} />
    </div>
  );
};

type ListProps = {
  links: LinkProps[];
  prefix: string;
  width: number;
  height: number;
  rowHeight: number;
};

export const DeleteDialogList: React.FC<ListProps> = ({
  links,
  prefix,
  width,
  height,
  rowHeight,
}) => {
  return (
    <List
      width={width}
      height={height}
      rowCount={links.length}
      rowHeight={rowHeight}
      rowRenderer={row(links)}
    />
  );
};
