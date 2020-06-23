import {
  useDrop as reactDndUseDrop,
  useDrag as reactDndUseDrag,
  DropTargetMonitor,
  ConnectDropTarget,
} from "react-dnd";

/*
  These hooks are wrappers around a 3rd party drag and drop library to make things as simple
  as possible to get drag and drop working. Not all functionality is available, but we
  can add that functionality as it's needed, in a clean, simple way.
*/

//////// Drag

export type DragConfiguration = {
  dragId: symbol;
};

export const useDrag = (configuration: DragConfiguration) => {
  const [_, dragRef] = reactDndUseDrag({
    item: { type: configuration.dragId },
  });

  return { dragRef };
};

//////// Drop

export type DropData<T> = T;

export type DropValidationData = {
  isOver(): boolean;
  canDrop(): boolean;
};

export type DropRef = ConnectDropTarget;

export type DropReturnData<T> = T & {
  dropRef: DropRef;
};

export type DropConfiguration<T = Record<string, any> | undefined> = {
  dragId: symbol;
  onDrop(dropData: DropData<T>): void;
  validateDrop(validationData: DropValidationData): T;
};

export const useDrop = <T>(
  configuration: DropConfiguration<T>
): DropReturnData<T> => {
  const [validations, dropRef] = reactDndUseDrop({
    accept: configuration.dragId,
    drop: () => {
      configuration.onDrop(validations);
    },
    collect: (monitor: DropTargetMonitor) => {
      return configuration.validateDrop({
        isOver: monitor.isOver.bind(monitor),
        canDrop: monitor.canDrop.bind(monitor),
      });
    },
  });

  return {
    ...validations,
    dropRef,
  };
};
