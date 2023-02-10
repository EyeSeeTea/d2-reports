import _ from "lodash";
import { Id } from "../../domain/common/entities/Base";
import { DataElement, DataElementM, DataForm, Section, SubSection } from "../../domain/common/entities/DataForm";
import { Period } from "../../domain/common/entities/DataValue";
import { DataFormRepository } from "../../domain/common/repositories/DataFormRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { isElementOfUnion } from "../../utils/ts-utils";

export class Dhis2DataFormRepository implements DataFormRepository {
    constructor(private api: D2Api) {}

    async get(options: { id: Id; orgUnitId: Id; period: Period }): Promise<DataForm> {
        const metadataQuery = getMetadataQuery(options);
        const res = await this.api.metadata.get(metadataQuery).getData();
        const dataSet = res.dataSets[0];

        if (!dataSet) return Promise.reject(new Error("Data set not found"));

        return {
            id: dataSet.id,
            optionSets: res.optionSets.map(os => ({
                ...os,
                options: os.options.map(o => ({ ...o, name: o.displayName })),
            })),
            sections: getSections(dataSet),
        };
    }
}

type D2DataSet = MetadataPick<ReturnType<typeof getMetadataQuery>>["dataSets"][number];

type D2DataElement = D2DataSet["sections"][number]["dataElements"][number];

const separator = " - ";

function getSections(dataSet: D2DataSet) {
    return dataSet.sections.map((section): Section => {
        return {
            id: section.id,
            name: section.displayName,
            subsections: _(section.dataElements)
                .groupBy(dataElement => _(dataElement.formName).split(separator).initial().join(separator))
                .toPairs()
                .map(([groupName, dataElementsForGroup]): SubSection => getSubsection(groupName, dataElementsForGroup))
                .value(),
        };
    });
}

function getSubsection(name: string, dataElements: D2DataElement[]): SubSection {
    return {
        name: name,
        dataElements: _(dataElements)
            .map((dataElement): DataElement | null => {
                const { valueType } = dataElement;

                if (isElementOfUnion(valueType, DataElementM.valueTypesSupported)) {
                    return {
                        ...dataElement,
                        valueType,
                        name: _(dataElement.formName).split(separator).last() || "-",
                        optionSet: dataElement.optionSet,
                    };
                } else {
                    console.error(
                        `Data element [formName=${dataElement.formName}, id=${dataElement.id}, valueType=${dataElement.valueType}] skipped, valueType not supported`
                    );
                    return null;
                }
            })
            .compact()
            .value(),
    };
}

function getMetadataQuery(options: { id: Id }) {
    return {
        dataSets: {
            fields: {
                id: true,
                sections: {
                    id: true,
                    displayName: true,
                    dataElements: {
                        id: true,
                        formName: true,
                        valueType: true,
                        optionSet: true,
                    },
                },
            },
            filter: { id: { eq: options.id } },
        },
        optionSets: {
            fields: {
                id: true,
                options: { id: true, displayName: true, code: true },
            },
        },
    } as const;
}
