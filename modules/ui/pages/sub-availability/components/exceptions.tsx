import * as React from "react";
import { AddException } from "./add-exception";
import { ExceptionList } from "./exception-list";
import { useMutationBundle } from "graphql/hooks";
import { SaveUnavailableTime } from "../graphql/save-exception.gen";
import { DeleteUnavailableTime } from "../graphql/delete-exception.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { UserUnavailableTimeInput } from "graphql/server-types.gen";

type Props = {
  userId: string;
  userCreatedDate: Date;
  isImpersonating: boolean;
  fromDate?: Date;
  toDate?: Date;
};

export const Exceptions: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();

  const [saveUnavailableTime] = useMutationBundle(SaveUnavailableTime, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deleteUnavailableTime] = useMutationBundle(DeleteUnavailableTime, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onSaveException = async (exception: UserUnavailableTimeInput) => {
    await saveUnavailableTime({
      variables: {
        unavailableTime: exception,
      },
      awaitRefetchQueries: true,
      refetchQueries: ["GetUnavilableTimeExceptions"],
    });
  };

  const onDeleteException = async (exceptionId: string) => {
    await deleteUnavailableTime({
      variables: {
        id: exceptionId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ["GetUnavilableTimeExceptions"],
    });
  };

  return (
    <>
      {!props.isImpersonating && (
        <AddException
          userId={props.userId}
          onSave={onSaveException}
          fromDate={props.fromDate}
          toDate={props.toDate}
        />
      )}
      <ExceptionList
        userId={props.userId}
        userCreatedDate={props.userCreatedDate}
        onDelete={onDeleteException}
      />
    </>
  );
};
