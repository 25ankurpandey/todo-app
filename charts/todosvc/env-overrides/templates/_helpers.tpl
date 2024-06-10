{{- define "todo-svc.fullname" -}}
{{- printf "%s-%s" .Chart.Name .Values.service.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "todo-svc.labels" -}}
app.kubernetes.io/name: {{ include "todo-svc.name" . }}
helm.sh/chart: {{ include "todo-svc.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "todo-svc.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todo-svc.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
