import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" className="min-h-screen bg-[#050508] text-slate-200 p-8 font-sans">
          <h1 className="text-xl font-bold text-rose-400 mb-2">حدث خطأ في التطبيق</h1>
          <p className="text-sm text-slate-400 mb-4">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
