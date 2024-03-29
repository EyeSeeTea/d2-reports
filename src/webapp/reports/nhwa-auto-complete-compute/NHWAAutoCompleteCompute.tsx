import React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import {
    ObjectsList,
    TableConfig,
    TablePagination,
    TableSorting,
    useLoading,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { getOrgUnitIdsFromPaths, getRootIds, OrgUnit } from "../../../domain/common/entities/OrgUnit";
import { CategoryOptionCombo, DataElement } from "../../../domain/common/entities/DataSet";
import { countryLevel } from "../common/nhwa-settings";
import { useReload } from "../../utils/use-reload";
import { Filters } from "../common/Filters";

export type AutoCompleteComputeViewModelWithPaging = {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
    rows: AutoCompleteComputeViewModel[];
};

export type AutoCompleteComputeViewModel = {
    id: string;
    dataElement: Pick<DataElement, "id" | "name">;
    orgUnit: Pick<OrgUnit, "id" | "name">;
    period: string;
    categoryOptionCombo: Pick<CategoryOptionCombo, "id" | "name">;
    correctValue: string;
    valueToFix: string;
    currentValue: string | undefined;
};

export const NHWAAutoCompleteCompute: React.FC = () => {
    const { compositionRoot, api, config } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const [reloadKey, reload] = useReload();
    const [selectedPeriods, setSelectedPeriods] = React.useState<string[]>([]);
    const [selectedOrgUnits, setSelectedOrgUnits] = React.useState<string[]>([]);
    const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
    const classes = useStyles();

    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    React.useEffect(() => {
        async function loadOrgUnits() {
            const orgUnits = await compositionRoot.orgUnits.getByLevel(String(countryLevel));
            setOrgUnits(orgUnits);
        }
        loadOrgUnits();
    }, [compositionRoot.orgUnits]);

    const baseConfig: TableConfig<AutoCompleteComputeViewModel> = React.useMemo(
        () => ({
            columns: [
                {
                    name: "dataElement",
                    text: i18n.t("Data Element"),
                    sortable: true,
                    getValue: row => (row.dataElement ? row.dataElement.name : ""),
                },
                {
                    name: "categoryOptionCombo",
                    text: i18n.t("Category Option Combo"),
                    sortable: true,
                    getValue: row => (row.categoryOptionCombo ? row.categoryOptionCombo.name : ""),
                },
                {
                    name: "orgUnit",
                    text: i18n.t("Organisation Unit"),
                    sortable: true,
                    getValue: row => (row.orgUnit ? row.orgUnit.name : ""),
                },
                { name: "period", text: i18n.t("Period"), sortable: true },
                { name: "correctValue", text: i18n.t("Correct Value"), sortable: true },
                {
                    name: "currentValue",
                    text: i18n.t("Current value"),
                    sortable: true,
                    getValue: row => row.currentValue || "Empty",
                },
            ],

            actions: [],
            initialSorting: {
                field: "dataElement" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
            globalActions: [
                {
                    name: "Fix Everything",
                    icon: <DoneAllIcon />,
                    text: i18n.t("Fix all incorrect values"),
                    onClick: async ids => {
                        if (ids.length === 0) return;
                        loading.show(true, i18n.t("Updating values..."));
                        const results = await compositionRoot.nhwa.getAutoCompleteComputeValues.execute({
                            cacheKey: reloadKey,
                            page: 1,
                            pageSize: 1e6,
                            sortingField: "dataElement",
                            sortingOrder: "asc",
                            filters: {
                                orgUnits: getOrgUnitIdsFromPaths(selectedOrgUnits),
                                periods: selectedPeriods,
                            },
                        });

                        compositionRoot.nhwa.fixAutoCompleteComputeValues
                            .execute(results.rows)
                            .then(stats => {
                                reload();
                                snackbar.openSnackbar("success", JSON.stringify(stats, null, 4), {
                                    autoHideDuration: 20 * 10000,
                                });
                                loading.hide();
                            })
                            .catch(err => {
                                snackbar.error(err);
                                loading.hide();
                            });
                    },
                },
            ],
        }),
        [compositionRoot, loading, snackbar, reload, reloadKey, selectedOrgUnits, selectedPeriods]
    );

    const getRows = React.useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<AutoCompleteComputeViewModel>) => {
            loading.show(true, i18n.t("Loading..."));
            const results = await compositionRoot.nhwa.getAutoCompleteComputeValues.execute({
                cacheKey: reloadKey,
                page: paging.page,
                pageSize: paging.pageSize,
                sortingField: sorting.field,
                sortingOrder: sorting.order,
                filters: {
                    orgUnits: getOrgUnitIdsFromPaths(selectedOrgUnits),
                    periods: selectedPeriods,
                },
            });
            loading.hide();
            return { pager: { ...results }, objects: results.rows };
        },
        [compositionRoot, reloadKey, selectedOrgUnits, selectedPeriods, loading]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Module 1 totals with missing sum or sum that does not match the auto-calculated")}
            </Typography>

            <ObjectsList<AutoCompleteComputeViewModel> {...tableProps} onChangeSearch={undefined}>
                <Filters
                    api={api}
                    rootIds={rootIds}
                    orgUnits={orgUnits}
                    selectedOrgUnits={selectedOrgUnits}
                    setSelectedOrgUnits={orgUnits => {
                        setSelectedOrgUnits(orgUnits);
                        reload();
                    }}
                    selectedPeriod={selectedPeriods}
                    setSelectedPeriods={periods => {
                        setSelectedPeriods(periods);
                        reload();
                    }}
                />
            </ObjectsList>
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
