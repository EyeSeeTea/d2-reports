import React, { useMemo, useState } from "react";
import { Filter, Filters } from "./amc-report/Filter";
import { TabPanel } from "../../../components/tabs/TabPanel";
import { TabHeader } from "../../../components/tabs/TabHeader";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import { ATCClassificationList } from "./atc-classification/ATCClassificationList";
import { AMCReport } from "./amc-report/AMCReport";
import { useFiles } from "./amc-report/useFiles";
import { TableConfig, useObjectsTable, TableColumn } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { Delete } from "@material-ui/icons";
import _ from "lodash";
import { DataMaintenanceViewModel } from "../DataMaintenanceViewModel";

export const DataMaintenanceList: React.FC = React.memo(() => {
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter());

    const {
        getFiles,
        pagination,
        initialSorting,
        isDeleteModalOpen,
        filesToDelete,
        deleteFiles,
        visibleColumns,
        saveReorderedColumns,
    } = useFiles(filters);

    const baseConfig: TableConfig<DataMaintenanceViewModel> = useMemo(
        () => ({
            actions: [
                {
                    name: "delete",
                    text: i18n.t("Delete"),
                    icon: <Delete />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => deleteFiles(selectedIds),
                    isActive: (rows: DataMaintenanceViewModel[]) => {
                        return _.every(rows, row => row.status !== "DELETED");
                    },
                },
            ],
            columns: [
                { name: "fileName", text: i18n.t("File"), sortable: true },
                { name: "fileType", text: i18n.t("File type"), sortable: false },
                { name: "orgUnitName", text: i18n.t("Country"), sortable: true },
                { name: "period", text: i18n.t("Year"), sortable: true },
                {
                    name: "status",
                    text: i18n.t("Status"),
                    sortable: true,
                },
            ],
            initialSorting: initialSorting,
            paginationOptions: pagination,
        }),
        [deleteFiles, initialSorting, pagination]
    );

    const tableProps = useObjectsTable<DataMaintenanceViewModel>(baseConfig, getFiles);

    const columnsToShow = useMemo<TableColumn<DataMaintenanceViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [tableProps.columns, visibleColumns]);

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <React.Fragment>
            <Filters values={filters} onChange={setFilters} />

            <TabHeader labels={reportTabs} tabIndex={tabIndex} onChange={handleChange} />

            <TabPanel value={tabIndex} index={0}>
                <AMCReport filters={filters} />
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
                <ATCClassificationList />
            </TabPanel>

            <LoadingScreen isOpen={isDeleteModalOpen} />
        </React.Fragment>
    );
});

const reportTabs = ["AMC Report", "ATC Classification"];

function getEmptyDataValuesFilter(): Filter {
    return {
        module: undefined,
    };
}
