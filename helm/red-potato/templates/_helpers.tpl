{{/*
Expand the name of the chart.
*/}}
{{- define "red-potato.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "red-potato.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "red-potato.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "red-potato.labels" -}}
helm.sh/chart: {{ include "red-potato.chart" . }}
{{ include "red-potato.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "red-potato.selectorLabels" -}}
app.kubernetes.io/name: {{ include "red-potato.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "red-potato.backend.labels" -}}
{{ include "red-potato.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "red-potato.backend.selectorLabels" -}}
{{ include "red-potato.selectorLabels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "red-potato.frontend.labels" -}}
{{ include "red-potato.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "red-potato.frontend.selectorLabels" -}}
{{ include "red-potato.selectorLabels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
PostgreSQL labels
*/}}
{{- define "red-potato.postgresql.labels" -}}
{{ include "red-potato.labels" . }}
app.kubernetes.io/component: postgresql
{{- end }}

{{/*
PostgreSQL selector labels
*/}}
{{- define "red-potato.postgresql.selectorLabels" -}}
{{ include "red-potato.selectorLabels" . }}
app.kubernetes.io/component: postgresql
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "red-potato.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "red-potato.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Backend fullname
*/}}
{{- define "red-potato.backend.fullname" -}}
{{- printf "%s-backend" (include "red-potato.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Frontend fullname
*/}}
{{- define "red-potato.frontend.fullname" -}}
{{- printf "%s-frontend" (include "red-potato.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
PostgreSQL fullname
*/}}
{{- define "red-potato.postgresql.fullname" -}}
{{- printf "%s-postgresql" (include "red-potato.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Secrets fullname
*/}}
{{- define "red-potato.secrets.fullname" -}}
{{- printf "%s-secrets" (include "red-potato.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
ConfigMap fullname
*/}}
{{- define "red-potato.configmap.fullname" -}}
{{- printf "%s-config" (include "red-potato.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Database URL
*/}}
{{- define "red-potato.databaseUrl" -}}
{{- if .Values.postgresql.external.enabled }}
{{- printf "postgresql://%s:$(DB_PASSWORD)@%s:%d/%s" .Values.postgresql.external.username .Values.postgresql.external.host (int .Values.postgresql.external.port) .Values.postgresql.external.database }}
{{- else }}
{{- printf "postgresql://%s:$(DB_PASSWORD)@%s:5432/%s" .Values.postgresql.auth.username (include "red-potato.postgresql.fullname" .) .Values.postgresql.auth.database }}
{{- end }}
{{- end }}

{{/*
Image pull secrets
*/}}
{{- define "red-potato.imagePullSecrets" -}}
{{- with .Values.global.imagePullSecrets }}
imagePullSecrets:
{{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}
