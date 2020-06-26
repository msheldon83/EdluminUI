import {
  useDrop as reactDndUseDrop,
  useDrag as reactDndUseDrag,
  DropTargetMonitor,
  DragLayerMonitor,
  ConnectDropTarget,
  ConnectDragSource,
  ConnectDragPreview,
  DragObjectWithType,
} from "react-dnd";

/*
  These hooks are wrappers around a 3rd party drag and drop library to make things as simple
  as possible to get drag and drop working. Not all functionality is available, but we
  can add that functionality as it's needed, in a clean, simple way.
*/

//////// Drag

export type DragValidationData = {
  isDragging(): boolean;
};

export type DragHandleRef = ConnectDragSource;
export type DragPreviewRef = ConnectDragPreview;

export type DragReturnData<T> = T & {
  dragHandleRef: DragHandleRef;
  dragPreviewRef: DragPreviewRef;
};

export type DragConfiguration<
  T = Record<string, any> | undefined,
  U = Record<string, any> | undefined
> = {
  dragId: symbol;
  /*
    TODO:

    Need to figure out a way to make this function optional
    The type errors are weird and hard to figure out
  */
  generateDragValues(validationData: DragValidationData): T;
  data?: U;
  dragEnd?(data: U): void;
};

export const useDrag = <T>(
  configuration: DragConfiguration<T>
): DragReturnData<T> => {
  const [validations, dragHandleRef, dragPreviewRef] = reactDndUseDrag({
    item: { ...configuration.data, type: configuration.dragId },
    collect: (monitor: DragLayerMonitor) => {
      return configuration.generateDragValues({
        isDragging: monitor.isDragging.bind(monitor),
      });
    },
    end() {
      configuration.dragEnd?.(configuration.data);
    },
  });

  return { ...validations, dragHandleRef, dragPreviewRef };
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
  onDrop?(data: any, dropData: DropData<T>): void;
  generateDropValues(validationData: DropValidationData): T;
  canDrop?(): boolean;
  onHover?(data: any): void;
};

export const useDrop = <T>(
  configuration: DropConfiguration<T>
): DropReturnData<T> => {
  const [validations, dropRef] = reactDndUseDrop({
    accept: configuration.dragId,
    drop: data => {
      configuration.onDrop?.(data, validations);
    },
    canDrop: configuration.canDrop?.bind(configuration),
    hover: item => configuration.onHover?.(item),
    collect: (monitor: DropTargetMonitor) => {
      return configuration.generateDropValues({
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
