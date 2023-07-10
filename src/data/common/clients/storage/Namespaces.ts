export const d2ReportsDataStoreNamespace = "d2-reports";
export const glassDataStoreNamespace = "glass";
export const constantPrefix = "D2 Report Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    NHWA_APPROVAL_STATUS_USER_COLUMNS: "nhwa-approval-status-user-columns",
    MAL_APPROVAL_STATUS_USER_COLUMNS: "mal-approval-status-user-columns",
    MAL_DIFF_STATUS_USER_COLUMNS: "mal-diff-status-user-columns",
    MAL_DIFF_NAMES_SORT_ORDER: "mal-diff-names-sort-order",
    MONITORING: "monitoring",
<<<<<<< HEAD
    MAL_SUBSCRIPTION_STATUS_USER_COLUMNS: "mal-subscription-status-user-columns",
    MAL_SUBSCRIPTION_STATUS: "mal-subscription-status",
=======
    DATA_SUBMISSSIONS: "data-submissions",
    DATA_SUBMISSSIONS_USER_COLUMNS: "data-submissions-user-columns",
    DATA_SUBMISSSIONS_MODULES: "modules",
    DATA_SUBMISSSIONS_UPLOADS: "uploads",
>>>>>>> development
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.NHWA_APPROVAL_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_DIFF_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_DIFF_NAMES_SORT_ORDER]: [],
    [Namespaces.MONITORING]: [],
<<<<<<< HEAD
    [Namespaces.MAL_SUBSCRIPTION_STATUS]: [],
=======
    [Namespaces.DATA_SUBMISSSIONS]: [],
    [Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS]: [],
    [Namespaces.DATA_SUBMISSSIONS_MODULES]: [],
    [Namespaces.DATA_SUBMISSSIONS_UPLOADS]: [],
>>>>>>> development
};
