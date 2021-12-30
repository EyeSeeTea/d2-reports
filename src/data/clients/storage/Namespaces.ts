export const dataStoreNamespace = "d2-reports";
export const constantPrefix = "Report Columns Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    NHWA_APPROVAL_STATUS: "nhwa-approval-status",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.NHWA_APPROVAL_STATUS]: [],
};
