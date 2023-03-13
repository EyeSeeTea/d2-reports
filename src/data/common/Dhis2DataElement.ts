import _ from "lodash";
import { Id } from "../../domain/common/entities/Base";
import { DataElement } from "../../domain/common/entities/DataElement";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { promiseMap } from "../../utils/promises";
import { Dhis2DataStoreDataForm } from "./Dhis2DataStoreDataForm";

export class Dhis2DataElement {
    constructor(private api: D2Api) {}

    async get(ids: Id[]): Promise<Record<Id, DataElement>> {
        const config = await Dhis2DataStoreDataForm.build(this.api);
        const idGroups = _(ids).uniq().chunk(100).value();

        const resList = await promiseMap(idGroups, idsGroup =>
            this.api.metadata
                .get({
                    dataElements: {
                        fields: dataElementFields,
                        filter: { id: { in: idsGroup } },
                    },
                })
                .getData()
        );

        return _(resList)
            .flatMap(res => res.dataElements)
            .map(d2DataElement => getDataElement(d2DataElement, config))
            .compact()
            .map(dataElement => [dataElement.id, dataElement] as [Id, typeof dataElement])
            .fromPairs()
            .value();
    }
}

const dataElementFields = {
    id: true,
    code: true,
    displayName: true,
    displayDescription: true,
    formName: true,
    valueType: true,
    optionSet: {
        id: true,
        options: { id: true, displayName: true, code: true },
    },
} as const;

type D2DataElement = MetadataPick<{
    dataElements: { fields: typeof dataElementFields };
}>["dataElements"][number];

function getDataElement(dataElement: D2DataElement, config: Dhis2DataStoreDataForm): DataElement | null {
    const { valueType } = dataElement;
    const deConfig = config.dataElementsConfig[dataElement.code];
    const optionSetFromDataElement = dataElement.optionSet
        ? {
              ...dataElement.optionSet,
              options: dataElement.optionSet.options.map(option => ({
                  name: option.displayName,
                  value: option.code,
              })),
          }
        : null;
    const optionSetFromCustomConfig = deConfig?.selection?.optionSet;
    const optionSet = optionSetFromCustomConfig || optionSetFromDataElement;

    const base = {
        id: dataElement.id,
        code: dataElement.code,
        name: dataElement.formName || dataElement.displayName,
        description: dataElement.displayDescription,
        options: optionSet
            ? { isMultiple: Boolean(deConfig?.selection?.isMultiple), items: optionSet.options }
            : undefined,
    };

    switch (valueType) {
        case "TEXT":
        case "LONG_TEXT":
            return { type: "TEXT", ...base };
        case "INTEGER":
        case "INTEGER_NEGATIVE":
        case "INTEGER_POSITIVE":
        case "INTEGER_ZERO_OR_POSITIVE":
        case "NUMBER":
            return { type: "NUMBER", numberType: valueType, ...base };
        case "BOOLEAN":
            return { type: "BOOLEAN", isTrueOnly: false, ...base };
        case "TRUE_ONLY":
            return { type: "BOOLEAN", isTrueOnly: true, ...base };
        case "FILE_RESOURCE":
            return { type: "FILE", ...base };
        default:
            console.error(
                `Data element [formName=${dataElement.formName}, id=${dataElement.id}, valueType=${dataElement.valueType}] skipped, valueType not supported`
            );
            return null;
    }
}
