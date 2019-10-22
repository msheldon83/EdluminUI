import * as React from "react";

type ErrorState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<object, ErrorState> {
  constructor(props: object) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError = (error: Error) => {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  };

  componentDidCatch = (error: Error | null, errorInfo: object) => {
    // TODO: log error to whatever service we use for the frontend
    console.error(error, errorInfo);
  };

  render() {
    if (this.state.hasError) {
      return <h1>There was an error loading your data</h1>;
    }

    return this.props.children;
  }
}
