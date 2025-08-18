import { useCallback } from "react";
import _ from "lodash";
import { DataApprovalViewModel } from "../../DataApprovalViewModel";
import { useDataApprovalPermissions } from "./useDataApprovalPermissions";
import { Id } from "../../../../../domain/common/entities/Base";
import { useAppContext } from "../../../../contexts/app-context";

type ActiveDataApprovalActionsState = {
    isActivateMonitoringActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isApproveActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isCompleteActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isDeactivateMonitoringActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isGetDifferenceActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isGetDifferenceAndRevokeActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isIncompleteActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isRevokeActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isSubmitActionVisible: (rows: DataApprovalViewModel[]) => boolean;
};

export function useActiveDataApprovalActions(dataSetId: Id): ActiveDataApprovalActionsState {
    const { config } = useAppContext();
    const { isMalAdmin } = useDataApprovalPermissions();

    const access = config.currentUser.dataSets ? config.currentUser.dataSets[dataSetId] : undefined;

    const isActivateMonitoringActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => !row.monitoring) && Boolean(isMalAdmin || access?.monitoring),
        [isMalAdmin, access]
    );

    const isApproveActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => {
            return (
                _.every(rows, row => row.lastUpdatedValue && Number(row.modificationCount) > 0) &&
                Boolean(isMalAdmin || access?.approve)
            );
        },
        [isMalAdmin, access]
    );

    const isCompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => !row.completed && row.lastUpdatedValue) && Boolean(isMalAdmin || access?.complete),
        [isMalAdmin, access]
    );

    const isDeactivateMonitoringActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.monitoring) && Boolean(isMalAdmin || access?.monitoring),
        [isMalAdmin, access]
    );

    const isGetDifferenceActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.lastUpdatedValue && !row.validated) && Boolean(access?.read || isMalAdmin),
        [isMalAdmin, access]
    );

    const isGetDifferenceAndRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.lastUpdatedValue && row.validated) && Boolean(access?.read || isMalAdmin),
        [isMalAdmin, access]
    );

    const isIncompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.completed && !row.validated) && Boolean(isMalAdmin || access?.incomplete),
        [isMalAdmin, access]
    );

    const isSubmitActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => !row.approved && row.lastUpdatedValue) && Boolean(access?.submit || isMalAdmin),
        [isMalAdmin, access]
    );

    const isRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => _.every(rows, row => row.approved) && Boolean(isMalAdmin || access?.revoke),
        [isMalAdmin, access]
    );

    return {
        isActivateMonitoringActionVisible: isActivateMonitoringActionVisible,
        isApproveActionVisible: isApproveActionVisible,
        isCompleteActionVisible: isCompleteActionVisible,
        isDeactivateMonitoringActionVisible: isDeactivateMonitoringActionVisible,
        isGetDifferenceActionVisible: isGetDifferenceActionVisible,
        isGetDifferenceAndRevokeActionVisible: isGetDifferenceAndRevokeActionVisible,
        isIncompleteActionVisible: isIncompleteActionVisible,
        isRevokeActionVisible: isRevokeActionVisible,
        isSubmitActionVisible: isSubmitActionVisible,
    };
}
