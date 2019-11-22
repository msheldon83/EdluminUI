import * as React from "react";
import { Button } from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router";

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
      return (
        <>
          <h1>An error has occurred.</h1>
          <Button variant="contained" color="primary" onClick={this.dismiss}>
            Dismiss
          </Button>
        </>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withRouter(InnerErrorBoundary);
