import { Button, Chip } from "@material-ui/core";
import React, { useMemo } from "react";
import i18n from "../../../../../locales";
import { ObjectsList, TableColumn, TableConfig, useObjectsTable } from "@eyeseetea/d2-ui-components";
import { ATCViewModel } from "../../DataMaintenanceViewModel";
import { Update } from "@material-ui/icons";
import { useATC } from "./useATC";
import _ from "lodash";
import styled from "styled-components";

export const ATCClassificationList: React.FC = React.memo(() => {
    const { initialSorting, pagination, visibleColumns, getATCs, saveReorderedColumns } = useATC();

    const baseConfig: TableConfig<ATCViewModel> = useMemo(
        () => ({
            actions: [
                {
                    name: "patch",
                    text: i18n.t("Patch"),
                    icon: <Update />,
                    multiple: true,
                },
            ],
            columns: [
                {
                    name: "currentVersion",
                    text: i18n.t(" "),
                    sortable: false,
                    getValue: row => row.currentVersion && <Chip color="primary" label={i18n.t("Current")} />,
                },
                { name: "year", text: i18n.t("Year"), sortable: true },
                { name: "uploadedDate", text: i18n.t("Uploaded date"), sortable: true },
            ],
            initialSorting: initialSorting,
            paginationOptions: pagination,
        }),
        [initialSorting, pagination]
    );

    const tableProps = useObjectsTable<ATCViewModel>(baseConfig, getATCs);

    const columnsToShow = useMemo<TableColumn<ATCViewModel>[]>(() => {
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

    return (
        <React.Fragment>
            <StyledButtonContainer>
                <Button color="primary" variant="contained">
                    {i18n.t("Upload new ATC file")}
                </Button>
                <Button color="primary" variant="contained">
                    {i18n.t("Recalculate logic")}
                </Button>
            </StyledButtonContainer>

            <ObjectsList<ATCViewModel>
                {...tableProps}
                columns={columnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedColumns}
            />
        </React.Fragment>
    );
});

const StyledButtonContainer = styled.div`
    display: flex;
    justify-content: end;
    gap: 1rem;
`;
