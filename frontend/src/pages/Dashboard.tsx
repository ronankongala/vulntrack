import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  listVulnerabilities,
  SEVERITIES,
  SEVERITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Severity,
  type Status,
  type Vulnerability,
} from '../api';
import SeverityBadge from '../SeverityBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  // Filters live in the URL so they survive navigating to a detail view and back
  const [searchParams, setSearchParams] = useSearchParams();
  const severity = (searchParams.get('severity') ?? '') as Severity | '';
  const status = (searchParams.get('status') ?? '') as Status | '';

  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listVulnerabilities({ severity, status })
      .then((data) => !cancelled && setVulns(data))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [severity, status]);

  function setFilter(key: 'severity' | 'status', value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <section>
      <h1>Vulnerabilities</h1>

      <div className="filters">
        <label>
          Severity
          <select value={severity} onChange={(e) => setFilter('severity', e.target.value)}>
            <option value="">All</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>
        {(severity || status) && (
          <button type="button" className="secondary" onClick={() => setSearchParams({})}>
            Clear filters
          </button>
        )}
      </div>

      {error && <div className="alert error">Failed to load vulnerabilities: {error}</div>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : !error && vulns.length === 0 ? (
        <p className="muted">No vulnerabilities match the current filters.</p>
      ) : (
        !error && (
          <table className="vuln-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th className="num">CVSS</th>
              </tr>
            </thead>
            <tbody>
              {vulns.map((v) => (
                <tr
                  key={v.id}
                  className={`row-${v.severity.toLowerCase()}`}
                  onClick={() => navigate(`/vulnerabilities/${v.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/vulnerabilities/${v.id}`)}
                  tabIndex={0}
                >
                  <td>{v.title}</td>
                  <td><SeverityBadge severity={v.severity} /></td>
                  <td>{STATUS_LABELS[v.status]}</td>
                  <td className="num">{v.cvssScore ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
      {!loading && !error && <p className="muted">{vulns.length} result(s)</p>}
    </section>
  );
}
