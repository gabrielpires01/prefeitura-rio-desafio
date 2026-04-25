#!/usr/bin/env bash
set -e
NOCOVER="/cmd/api|/internal/database"
COVERPKG=$(go list ./... | grep -vE "$NOCOVER" | paste -sd ',')
go test -tags integration -coverprofile=coverage.out -coverpkg="$COVERPKG" -timeout 120s ./...
go tool cover -func=coverage.out
