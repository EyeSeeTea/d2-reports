import _ from "lodash";
import { DataElementSubscription } from "../../../../domain/reports/mal-data-subscription/entities/DataElementSubscription";
import { D2DataElement } from "../DataElementSubscriptionD2Repository";
import { D2Dashboard, D2DataDimensionItem } from "../DashboardSubscriptionD2Repository";
import {
    DashboardSubscription,
    VisualizationSubscription,
} from "../../../../domain/reports/mal-data-subscription/entities/DashboardSubscription";
import { D2Visualization } from "../VisualizationSubscriptionD2Repository";

export function getDataElementsInParent(options: {
    type: "dashboards";
    entity: D2Dashboard;
    dataElements: D2DataElement[];
}): DashboardSubscription;

export function getDataElementsInParent(options: {
    type: "visualizations";
    entity: D2Visualization;
    dataElements: D2DataElement[];
}): VisualizationSubscription;

export function getDataElementsInParent(
    options: DataElementSubscriptionParent
): DashboardSubscription | VisualizationSubscription {
    const { type, entity, dataElements } = options;

    switch (type) {
        case "dashboards": {
            const dataDimensionItems = _(entity.dashboardItems)
                .map(item => item.visualization.dataDimensionItems as D2DataDimensionItem[])
                .flattenDeep()
                .compact()
                .value();
            const dataElementsWithGroups = extractChildDataElements(dataDimensionItems, dataElements);

            return {
                type: type,
                id: entity.id,
                name: entity.name,
                children: mapD2DataElementsToSubscription(dataElementsWithGroups),
            };
        }
        case "visualizations": {
            const dataDimensionItems = entity.dataDimensionItems as D2DataDimensionItem[];
            const dataElementsWithGroups = extractChildDataElements(dataDimensionItems, dataElements);

            return {
                type: type,
                id: entity.id,
                name: entity.name,
                children: mapD2DataElementsToSubscription(dataElementsWithGroups),
            };
        }
    }
}

function mapD2DataElementsToSubscription(dataElements: D2DataElement[]): DataElementSubscription[] {
    return dataElements.map(dataElement => {
        const section = dataElement.dataSetElements
            .flatMap(dataSetElement => dataSetElement.dataSet.sections)
            .find(section => _.some(section.dataElements, { id: dataElement.id }));

        return {
            dataElementId: dataElement.id,
            dataElementName: dataElement.name,
            dataElementCode: dataElement.code,
            dataSetName: dataElement.dataSetElements[0]?.dataSet.name ?? "",
            dataElementGroups: dataElement.dataElementGroups,
            section: section,
        };
    });
}

function extractChildDataElements(
    dataDimensionItems: D2DataDimensionItem[],
    dataElements: D2DataElement[]
): D2DataElement[] {
    const indicatorVariables = _(dataDimensionItems)
        .map(dimensionItem => [dimensionItem.indicator?.numerator, dimensionItem.indicator?.denominator])
        .flattenDeep()
        .compact()
        .value();

    const dataElementVariables = _.uniq(
        _.compact(_.flatMap(indicatorVariables, str => str.match(/#{([a-zA-Z0-9]+)}/g)))
    );

    const dataElementIds = dataElementVariables
        .map(token => token.slice(2, -1))
        .filter(id => /^[a-zA-Z0-9]+$/.test(id));

    return _.filter(dataElements, dataElement => dataElementIds.includes(dataElement.id));
}

type DataElementSubscriptionParent =
    | {
          type: "dashboards";
          entity: D2Dashboard;
          dataElements: D2DataElement[];
      }
    | {
          type: "visualizations";
          entity: D2Visualization;
          dataElements: D2DataElement[];
      };
