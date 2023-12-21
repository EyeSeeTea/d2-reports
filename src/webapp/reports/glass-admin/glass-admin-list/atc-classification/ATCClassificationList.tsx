import { Button, Chip } from "@material-ui/core";
import React, { useMemo, useState } from "react";
import i18n from "../../../../../locales";
import { ObjectsList, TableColumn, TableConfig, useObjectsTable } from "@eyeseetea/d2-ui-components";
import { ATCViewModel } from "../../DataMaintenanceViewModel";
import { CloudUpload } from "@material-ui/icons";
import { useATC } from "./useATC";
import _ from "lodash";
import styled from "styled-components";
import { GLASSAdminDialog } from "./GLASSAdminDialog";
import {
    ATCItemIdentifier,
    parseATCItemId,
} from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { useATCUpload } from "./useATCUpload";

export const ATCClassificationList: React.FC = React.memo(() => {
    const { initialSorting, pagination, uploadedYears, visibleColumns, getATCs, reload, saveReorderedColumns } =
        useATC();
    const {
        isPatchModalOpen,
        isUploadATCModalOpen,
        closePatchModal,
        closeUploadATCModal,
        openPatchModal,
        openUploadATCModal,
        patchVersion,
        uploadATCFile,
    } = useATCUpload(reload);

    const [isCurrentVersion, setCurrentVersion] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<ATCItemIdentifier[]>([]);

    const baseConfig: TableConfig<ATCViewModel> = useMemo(
        () => ({
            actions: [
                {
                    name: "patch",
                    text: i18n.t("Patch"),
                    icon: <CloudUpload />,
                    onClick: async (selectedIds: string[]) => {
                        openPatchModal();
                        const items = _.compact(selectedIds.map(item => parseATCItemId(item)));
                        if (items.length === 0) return;

                        setSelectedItems(items);

                        const isCurrentVersion = _(items)
                            .map(item => item.currentVersion)
                            .every();
                        setCurrentVersion(isCurrentVersion);
                    },
                },
            ],
            columns: [
                {
                    name: "currentVersion",
                    text: i18n.t(" "),
                    sortable: false,
                    getValue: row => row.currentVersion && <Chip color="primary" label={i18n.t("Current Version")} />,
                },
                { name: "year", text: i18n.t("Year"), sortable: true },
                { name: "uploadedDate", text: i18n.t("Uploaded date"), sortable: true },
            ],
            initialSorting: initialSorting,
            paginationOptions: pagination,
        }),
        [initialSorting, openPatchModal, pagination]
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
                <Button onClick={openUploadATCModal} color="primary" variant="contained">
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

            <GLASSAdminDialog
                selectedItems={selectedItems}
                isOpen={isPatchModalOpen}
                closeModal={closePatchModal}
                description={
                    isCurrentVersion
                        ? "You are replacing the latest ATC file. It will become the default version"
                        : "You are replacing an old ATC file. It won't affect calculations"
                }
                title="Patch version"
                saveFile={patchVersion}
            />

            <GLASSAdminDialog
                isOpen={isUploadATCModalOpen}
                closeModal={closeUploadATCModal}
                description="All years will be overwritten with the data provided in this file."
                title="Upload new ATC file"
                uploadedYears={uploadedYears}
                saveFile={uploadATCFile}
            />
        </React.Fragment>
    );
});

const StyledButtonContainer = styled.div`
    display: flex;
    justify-content: end;
    gap: 1rem;
`;
