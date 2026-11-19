import { Component } from "react";
export default class RouteError extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main id="kryesore" className="wrap catalog-main">
        <div className="empty-state">
          <h1>Faqja nuk u ngarkua.</h1>
          <p>Kontrollo lidhjen dhe provo përsëri.</p>
          <button
            className="btn btn-dark"
            onClick={() => window.location.reload()}
          >
            Provo përsëri
          </button>
        </div>
      </main>
    );
  }
}
