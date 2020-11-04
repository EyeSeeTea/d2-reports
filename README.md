## Introduction

_d2-report_ provides the infrastructure to create DHIS2 reports with a React frontend.

Those reports developed an an standard webapp, and they can both be used as an standalone DHIS2 webapp or an standard HTML report (App: Reports).

Target DHIS2: 2.34.

## Reports

### NHWA Comments

This report shows data values for data sets `NHWA Module ...`. There are two kinds of data values displayed in the report table:

1. Data values that have comments.
2. Data values related pairs (value/comment), which are rendered as a single row. The criteria to stablish a relationship between data elements is:

    - Comment data element: `NHWA_Comment of Abc`.
    - Value data element: `NHWA_Abc`.

The API endpoint `/dataValueSets` does not provide all the features required for this report, so we use a custom SQL View. It will be included in the generated metadata.

We use the data element group to put data elements in the same sections together. Note that only data elements belonging to a data element group will be displayed.

## Initial setup

```
$ yarn install
```

## Development

Start development server at `http://localhost:8082` using `https://play.dhis2.org/2.34` as backend:

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/2.34" yarn start
```

## Deploy

```
$ yarn build-report # Creates dist/public.html
$ yarn build-metadata # Created dist/metadata.json
$ yarn post-metadata http://server.org 'user:password'
```

Create web-app zip (`dist/d2-reports.zip`):

```
$ yarn build-webapp
```
