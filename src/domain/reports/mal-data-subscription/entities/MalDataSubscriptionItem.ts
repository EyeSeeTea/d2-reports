export interface MalDataSubscriptionItem {
    dataElementName: string;
    subscription: string;
    sectionName: string;
    sectionId: string;
    lastDateOfSubscription: string;
}

export interface MalDataSubscriptionItemIdentifier {
    dataElementName: string;
    sectionName: string;
}

export function getDataSubscriptionItemId(dataSet: MalDataSubscriptionItem): string {
    return [dataSet.dataElementName, dataSet.sectionName, dataSet.lastDateOfSubscription].join("-");
}

export function parseDataSubscriptionItemId(string: string): MalDataSubscriptionItemIdentifier | undefined {
    const [dataElementName, sectionName] = string.split("-");
    if (!dataElementName || !sectionName) return undefined;

    return { dataElementName, sectionName };
}
