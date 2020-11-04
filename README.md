## Introduction

d2-report provides the infrastructure to create DHIS2 reports using a React frontend. They are written and used in development as an standard webapp so they can both be used as DHIS2 webapp or as an stadard HTML report.

## Setup

```
$ yarn install
```

## Development

Start development server (in the exaple: `http://localhost:8082`):

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/dev" yarn start
```

## Build

Create report (`report-build/index.html`):

```
$ yarn build-report
```

Create web-app zip (`d2-reports.zip`):

```
$ yarn build-webapp
```
