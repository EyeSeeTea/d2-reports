import _ from "lodash";
import { getId, Id } from "../../domain/common/entities/Base";
import { DataElement } from "../../domain/common/entities/DataElement";
import { DataForm, Section, SectionBase } from "../../domain/common/entities/DataForm";
import { Period } from "../../domain/common/entities/DataValue";
import { DataFormRepository } from "../../domain/common/repositories/DataFormRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { Dhis2DataElement } from "./Dhis2DataElement";
import { Dhis2DataStoreDataForm, SectionConfig } from "./Dhis2DataStoreDataForm";

export class Dhis2DataFormRepository implements DataFormRepository {
    constructor(private api: D2Api) {}

    async get(options: { id: Id; period: Period }): Promise<DataForm> {
        const metadata = await this.getMetadata(options);
        const dataSet = metadata.dataSets[0];
        if (!dataSet) return Promise.reject(new Error("Data set not found"));
        const config = await Dhis2DataStoreDataForm.build(this.api);
        const sections = await this.getSections(dataSet, config, options.period);
        const dataElements = _.flatMap(sections, section => section.dataElements);
        const dataElementsOptions = this.getDataElementsOptions(dataElements, config);
        const dataSetConfig = config.getDataSetConfig(dataSet, options.period);

        return {
            id: dataSet.id,
            dataElements: _.flatMap(sections, section => section.dataElements),
            sections: sections,
            texts: dataSetConfig.texts,
            options: {
                dataElements: dataElementsOptions,
            },
        };
    }

    private getDataElementsOptions(dataElements: DataElement[], config: Dhis2DataStoreDataForm) {
        const dataElementsByCode = _.keyBy(dataElements, de => de.code);
        const dataElementsOptions = _(config.dataElementsConfig)
            .toPairs()
            .map(([code, deConfig]) => {
                const dataElement = dataElementsByCode[code];
                if (!dataElement) return;
                const defaultWidget = dataElement.type === "BOOLEAN" ? "radio" : "dropdown";
                const value = { widget: deConfig.selection?.widget || defaultWidget };
                return [dataElement.id, value] as [typeof dataElement.id, typeof value];
            })
            .compact()
            .fromPairs()
            .value();
        return dataElementsOptions;
    }

    private async getMetadata(options: { id: Id }) {
        const metadataQuery = getMetadataQuery({ dataSetId: options.id });
        return this.api.metadata.get(metadataQuery).getData();
    }

    private async getSections(dataSet: D2DataSet, config: Dhis2DataStoreDataForm, period: Period) {
        const dataSetConfig = config.getDataSetConfig(dataSet, period);

        const dataElementIds = _(dataSet.sections)
            .flatMap(section => section.dataElements)
            .map(getId)
            .value();

        const dataElements = await new Dhis2DataElement(this.api).get(dataElementIds);

        return dataSet.sections.map((section): Section => {
            const base: SectionBase = {
                id: section.id,
                name: section.displayName,
                description: section.description,
                toggle: { type: "none" },
                dataElements: _(section.dataElements)
                    .map(dataElementRef => dataElements[dataElementRef.id])
                    .compact()
                    .value(),
            };

            const config = dataSetConfig.sections[section.id];
            if (!config) return { viewType: "table", ...base };

            const base2 = getSectionBaseWithToggle(config, base);

            return config.viewType === "grid-with-periods"
                ? { viewType: config.viewType, periods: config.periods, ...base2 }
                : { viewType: config.viewType, ...base2 };
        });
    }
}

type Metadata = ReturnType<typeof getMetadataQuery>;
type D2DataSet = MetadataPick<Metadata>["dataSets"][number];

function getMetadataQuery(options: { dataSetId: Id }) {
    return {
        dataSets: {
            fields: {
                id: true,
                code: true,
                sections: {
                    id: true,
                    code: true,
                    displayName: true,
                    description: true,
                    dataElements: { id: true },
                },
            },
            filter: { id: { eq: options.dataSetId } },
        },
    } as const;
}

function getSectionBaseWithToggle(config: SectionConfig, base: SectionBase): SectionBase {
    const { toggle } = config;

    switch (toggle.type) {
        case "dataElement": {
            const toggleDataElement = base.dataElements.find(de => de.code === toggle.code);

            if (toggleDataElement) {
                return {
                    ...base,
                    toggle: { type: "dataElement", dataElement: toggleDataElement },
                    dataElements: _.without(base.dataElements, toggleDataElement),
                };
            } else {
                console.warn(`Data element for toggle not found in section: ${toggle.code}`);
                return base;
            }
        }
        default:
            return base;
    }
}
