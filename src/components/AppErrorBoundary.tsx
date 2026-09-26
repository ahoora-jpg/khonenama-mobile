import React from "react";
import { ScreenState } from "./ScreenState";

type State = { failed: boolean };

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error) { console.error("KHONENAMA_RUNTIME_ERROR", error); }
  render() {
    if (this.state.failed) {
      return <ScreenState title="مشکلی پیش آمد" message="برنامه با یک خطای غیرمنتظره روبه‌رو شد." onRetry={() => this.setState({ failed: false })} />;
    }
    return this.props.children;
  }
}
