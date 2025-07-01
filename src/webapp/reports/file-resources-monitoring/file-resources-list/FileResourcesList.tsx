import React, { useEffect } from "react";
import { FileResourcesViewModel } from "./FileResourcesViewModel";
import { ConfirmationDialog, ObjectsList } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import { useFileResources } from "./useFileResources";

export const FileResourcesMonitorList: React.FC = React.memo(() => {
    const {
        tableProps,
        columnsToShow,
        saveReorderedColumns,
        setFilters,
        filters,
        downloadCsv,
        showConfirmDelete,
        deleteSelectedFiles,
        cancelConfirmDelete,
        openOwnerUrls,
        openFileResourceUrls,
        selectedIds,
    } = useFileResources();

    useEffect(() => {
        if (openOwnerUrls) {
            const ownerUrls = tableProps.rows.filter(row => selectedIds.includes(row.id)).map(row => row.ownerUrl);
            ownerUrls.forEach(ownerUrl => {
                if (ownerUrl) {
                    window.open(ownerUrl, "_blank");
                }
            });
        }
    }, [openOwnerUrls, selectedIds, tableProps.rows]);

    useEffect(() => {
        if (openFileResourceUrls) {
            const fileResourceUrls = tableProps.rows.filter(row => selectedIds.includes(row.id)).map(row => row.href);
            fileResourceUrls.forEach(fileResourceUrl => {
                if (fileResourceUrl) {
                    window.open(fileResourceUrl, "_blank");
                }
            });
        }
    }, [openFileResourceUrls, selectedIds, tableProps.rows]);

    return (
        <>
            <ObjectsList<FileResourcesViewModel>
                {...tableProps}
                columns={columnsToShow}
                onReorderColumns={saveReorderedColumns}
                onChangeSearch={value => {
                    setFilters({ ...filters, filenameQuery: value });
                }}
                globalActions={[downloadCsv]}
            ></ObjectsList>

            {showConfirmDelete && (
                <ConfirmationDialog
                    isOpen={true}
                    title={i18n.t("Delete confirmation")}
                    onCancel={cancelConfirmDelete}
                    cancelText={i18n.t("Cancel")}
                    onSave={deleteSelectedFiles}
                    saveText={i18n.t("Delete")}
                    maxWidth="md"
                >
                    <p>{i18n.t("Are you sure you want to delete the selected items?:")}</p>
                </ConfirmationDialog>
            )}
        </>
    );
});
