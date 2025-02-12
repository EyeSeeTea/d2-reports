import { useCallback } from "react";
import _ from "lodash";
import { DataApprovalViewModel } from "../../DataApprovalViewModel";
import { useDataApprovalPermissions } from "./useDataApprovalPermissions";

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

export function useActiveDataApprovalActions(): ActiveDataApprovalActionsState {
    const { isMalAdmin, isMalCountryApprover } = useDataApprovalPermissions();

    const isActivateMonitoringActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => _.every(rows, row => !row.monitoring) && isMalAdmin,
        [isMalAdmin]
    );

    const isApproveActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => _.every(rows, row => row.lastUpdatedValue) && isMalAdmin,
        [isMalAdmin]
    );

    const isCompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.completed === false && row.lastUpdatedValue) &&
            (isMalCountryApprover || isMalAdmin),
        [isMalAdmin, isMalCountryApprover]
    );

    const isDeactivateMonitoringActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => _.every(rows, row => row.monitoring) && isMalAdmin,
        [isMalAdmin]
    );

    const isGetDifferenceActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.lastUpdatedValue && row.validated === false) &&
            (isMalCountryApprover || isMalAdmin),
        [isMalAdmin, isMalCountryApprover]
    );

    const isGetDifferenceAndRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.lastUpdatedValue && row.validated === true) &&
            (isMalCountryApprover || isMalAdmin),
        [isMalAdmin, isMalCountryApprover]
    );

    const isIncompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => _.every(rows, row => row.completed === true && !row.validated),
        []
    );

    const isSubmitActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => row.approved === false && row.lastUpdatedValue) &&
            (isMalCountryApprover || isMalAdmin),
        [isMalAdmin, isMalCountryApprover]
    );

    const isRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => _.every(rows, row => row.approved === true),
        []
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
