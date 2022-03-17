export const dataStoreNamespace = "d2-reports";
export const constantPrefix = "D2 Report Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    NHWA_APPROVAL_STATUS_USER_COLUMNS: "nhwa-approval-status-user-columns",
    DATA_QUALITY_CONFIG: "data-quality-config",
    DATA_QUALITY_VALIDATION_RESULT: "data-quality-validation_result",
    DATA_QUALITY_LAST_UPDATED: "data-quality-last_updated",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.NHWA_APPROVAL_STATUS_USER_COLUMNS]: [],
    [Namespaces.DATA_QUALITY_CONFIG]: [],
    [Namespaces.DATA_QUALITY_VALIDATION_RESULT]: [],
    [Namespaces.DATA_QUALITY_LAST_UPDATED]: ["indicators", "programIndicators"],
};
