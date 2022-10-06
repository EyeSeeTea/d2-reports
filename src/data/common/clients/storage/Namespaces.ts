export const dataStoreNamespace = "d2-reports";
export const constantPrefix = "D2 Report Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    NHWA_APPROVAL_STATUS_USER_COLUMNS: "nhwa-approval-status-user-columns",
    MAL_APPROVAL_STATUS_USER_COLUMNS: "mal-approval-status-user-columns",
    MAL_DIFF_STATUS_USER_COLUMNS: "mal-diff-status-user-columns",
    MAL_DIFF_NAMES_SORT_ORDER: "mal-diff-names-sort-order",
    MONITORING: "monitoring",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.NHWA_APPROVAL_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_DIFF_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_DIFF_NAMES_SORT_ORDER]: [],
    [Namespaces.MONITORING]: [],
};
