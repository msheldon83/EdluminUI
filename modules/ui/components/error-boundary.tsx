import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router";
import { ErrorUI } from "./error";

type ErrorState = {
  hasError: boolean;
};

class InnerErrorBoundary extends React.Component<
  RouteComponentProps<{}>,
  ErrorState
> {
  constructor(props: RouteComponentProps<{}>) {
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

  dismiss = () => {
    this.setState({ hasError: false });
  };

  componentDidUpdate(prevProps: RouteComponentProps<{}>) {
    if (prevProps.location !== this.props.location) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorUI />;
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withRouter(InnerErrorBoundary);
