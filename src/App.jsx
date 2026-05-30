import ErrorBoundary from './components/ErrorBoundary';
import AunakEcosystemHub from './components/AunakEcosystemHub';

export default function App() {
  return (
    <ErrorBoundary>
      <AunakEcosystemHub />
    </ErrorBoundary>
  );
}
