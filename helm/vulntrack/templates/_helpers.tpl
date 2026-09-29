{{- define "vulntrack.labels" -}}
app.kubernetes.io/part-of: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{- define "vulntrack.selector" -}}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{- define "vulntrack.backend.name" -}}{{ .Release.Name }}-backend{{- end }}
{{- define "vulntrack.frontend.name" -}}{{ .Release.Name }}-frontend{{- end }}
{{- define "vulntrack.postgres.name" -}}{{ .Release.Name }}-postgres{{- end }}

{{/* Reuse an existing Secret value on upgrade so generated secrets stay stable. */}}
{{- define "vulntrack.secretValue" -}}
{{- $existing := lookup "v1" "Secret" .root.Release.Namespace .secret -}}
{{- if .value -}}
{{ .value | b64enc }}
{{- else if and $existing (index $existing.data .key) -}}
{{ index $existing.data .key }}
{{- else -}}
{{ randAlphaNum 48 | b64enc }}
{{- end -}}
{{- end }}
