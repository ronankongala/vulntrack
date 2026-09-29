import { SEVERITY_LABELS, type Severity } from './api';

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`badge sev-${severity.toLowerCase()}`}>{SEVERITY_LABELS[severity]}</span>;
}
