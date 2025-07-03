import _ from "lodash";
import { DataElementSubscription } from "../../../../domain/reports/mal-data-subscription/entities/DataElementSubscription";
import { D2DataElement } from "../DataElementSubscriptionD2Repository";

export function mapD2DataElementsToSubscription(dataElements: D2DataElement[]): DataElementSubscription[] {
    return dataElements.map(dataElement => {
        const section = dataElement.dataSetElements
            .flatMap(dataSetElement => dataSetElement.dataSet.sections)
            .find(section => _.some(section.dataElements, { id: dataElement.id }));

        return {
            dataElement: dataElement,
            section: section,
            dataElementGroups: dataElement.dataElementGroups,
        };
    });
}
