import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    
    // copy error info to user's clipboard and give them next steps
    this.state.copyText = () => {
      const textBox = document.getElementById("errorText");
      navigator.clipboard.writeText(textBox.value);
      alert("Error info copied!  Please paste the copied text in an email and send to hornhelperapp@gmail.com");
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error (optional)
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return <div>
        <h3>Something went wrong.</h3>
        <p>Please try refreshing the page.</p>
        <textarea id="errorText" className="error-text" value={this.state.error + this.state.errorInfo?.componentStack} />
        <button onClick={() => this.state.copyText()}>Copy error info to send report</button>
      </div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;