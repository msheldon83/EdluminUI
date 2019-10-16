type Props = {
  firstName?: string;
  lastName?: string;
};

export const getInitials = (props: Props) => {
  const { firstName, lastName } = props;

  return `${firstName ? firstName.substr(0, 1) : ""}${
    lastName ? lastName.substr(0, 1) : ""
  }`;
};
