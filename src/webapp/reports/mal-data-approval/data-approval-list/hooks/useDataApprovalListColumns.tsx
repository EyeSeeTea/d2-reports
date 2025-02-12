import { useCallback, useMemo } from "react";
import { DataApprovalViewModel } from "../../DataApprovalViewModel";
import { format } from "date-fns";
import i18n from "../../../../../locales";
import { TableColumn } from "@eyeseetea/d2-ui-components";

export function useDataApprovalListColumns() {
    const getColumnValues = useCallback((row: DataApprovalViewModel) => {
        return {
            completed: row.completed ? "Completed" : "Not completed",
            lastDateOfApproval: row.lastDateOfApproval
                ? format(row.lastDateOfApproval, "yyyy-MM-dd' 'HH:mm:ss")
                : "Never approved",
            lastDateOfSubmission: row.lastDateOfSubmission
                ? format(row.lastDateOfSubmission, "yyyy-MM-dd' 'HH:mm:ss")
                : "Never submitted",
            lastUpdatedValue: row.lastUpdatedValue ? format(row.lastUpdatedValue, "yyyy-MM-dd' 'HH:mm:ss") : "No data",
            validated: row.validated ? "Submitted" : row.completed ? "Ready for submission" : "Not completed",
        };
    }, []);

    const columns: TableColumn<DataApprovalViewModel>[] = useMemo(() => {
        return [
            { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
            { name: "period", text: i18n.t("Period"), sortable: true },
            { name: "dataSet", text: i18n.t("Data set"), sortable: true, hidden: true },
            { name: "attribute", text: i18n.t("Attribute"), sortable: true, hidden: true },
            {
                name: "completed",
                text: i18n.t("Completion status"),
                sortable: true,
                getValue: row => getColumnValues(row).completed,
            },
            {
                name: "validated",
                text: i18n.t("Submission status"),
                sortable: true,
                getValue: row => getColumnValues(row).validated,
            },
            { name: "modificationCount", text: i18n.t("Modification Count"), sortable: true },
            {
                name: "lastUpdatedValue",
                text: i18n.t("Last modification date"),
                sortable: true,
                getValue: row => getColumnValues(row).lastUpdatedValue,
            },
            {
                name: "lastDateOfSubmission",
                text: i18n.t("Last date of submission"),
                sortable: true,
                getValue: row => getColumnValues(row).lastDateOfSubmission,
            },
            {
                name: "lastDateOfApproval",
                text: i18n.t("Last date of approval"),
                sortable: true,
                getValue: row => getColumnValues(row).lastDateOfApproval,
            },
        ];
    }, [getColumnValues]);

    return {
        columns: columns,
    };
}
