import _ from "lodash";
import { D2Api } from "@eyeseetea/d2-api/2.34";
import { boolean, Codec, exactly, GetType, oneOf, optional, record, string } from "purify-ts";
import { dataStoreNamespace, Namespaces } from "./clients/storage/Namespaces";
import { isElementOfUnion, Maybe, NonPartial } from "../../utils/ts-utils";
import { Code, getCode, Id, NamedRef } from "../../domain/common/entities/Base";
import { Option } from "../../domain/common/entities/DataElement";
import { DataFormM, ViewType } from "../../domain/common/entities/DataForm";

export interface DataSetConfig {
    texts: { header: Maybe<string>; footer: Maybe<string> };
    viewType: ViewType;
    sections: Record<Id, { viewType: ViewType }>;
}

function sectionConfig<T extends Record<string, Codec<any>>>(properties: T) {
    return optional(record(string, Codec.interface(properties)));
}

const selector = Codec.interface({ code: string });

const DataStoreConfigCodec = Codec.interface({
    dataElements: sectionConfig({
        selection: optional(
            Codec.interface({
                optionSet: optional(selector),
                isMultiple: optional(boolean),
                widget: optional(oneOf([exactly("dropdown"), exactly("radio")])),
            })
        ),
    }),

    dataSets: sectionConfig({
        viewType: optional(string),
        texts: optional(
            Codec.interface({
                header: optional(oneOf([string, selector])),
                footer: optional(oneOf([string, selector])),
            })
        ),
        sections: optional(
            sectionConfig({
                viewType: optional(string),
            })
        ),
    }),
});

interface DataElementConfig {
    selection?: {
        optionSet?: OptionSet;
        isMultiple: boolean;
        widget: Maybe<"dropdown" | "radio">;
    };
}

interface OptionSet extends NamedRef {
    code: string;
    options: Option<string>[];
}

type Selector = GetType<typeof selector>;
type DataFormStoreConfigFromCodec = GetType<typeof DataStoreConfigCodec>;

interface DataFormStoreConfig {
    custom: NonPartial<DataFormStoreConfigFromCodec>;
    optionSets: OptionSet[];
    constants: Constant[];
}

const defaultDataStoreConfig: DataFormStoreConfig["custom"] = {
    dataElements: {},
    dataSets: {},
};

interface DataSet {
    id: Id;
    code: string;
    sections: Array<{ id: string; code: string }>;
}

export class Dhis2DataStoreDataForm {
    public dataElementsConfig: Record<Code, DataElementConfig>;

    constructor(private config: DataFormStoreConfig) {
        this.dataElementsConfig = this.getDataElementsConfig();
    }

    static async build(api: D2Api): Promise<Dhis2DataStoreDataForm> {
        const dataStore = api.dataStore(dataStoreNamespace);
        const storeValue = await dataStore.get<object>(Namespaces.AUTOGENERATED_FORMS).getData();
        if (!storeValue)
            return new Dhis2DataStoreDataForm({
                optionSets: [],
                constants: [],
                custom: defaultDataStoreConfig,
            });

        const config: DataFormStoreConfig = await DataStoreConfigCodec.decode(storeValue).caseOf<
            Promise<DataFormStoreConfig>
        >({
            Left: async errorMsg => {
                console.error("Cannot decode autogenerated forms config", {
                    value: storeValue,
                    error: errorMsg,
                });
                return { optionSets: [], constants: [], custom: defaultDataStoreConfig };
            },
            Right: async storeConfigFromDataStore => {
                const storeConfig: DataFormStoreConfig["custom"] = {
                    dataElements: storeConfigFromDataStore.dataElements || {},
                    dataSets: storeConfigFromDataStore.dataSets || {},
                };

                return {
                    custom: storeConfig,
                    optionSets: await this.getOptionSets(api, storeConfig),
                    constants: await this.getConstants(api, storeConfig),
                };
            },
        });

        return new Dhis2DataStoreDataForm(config);
    }

    private static async getOptionSets(api: D2Api, storeConfig: DataFormStoreConfig["custom"]): Promise<OptionSet[]> {
        const codes = _(storeConfig.dataElements)
            .values()
            .map(obj => obj.selection?.optionSet)
            .compact()
            .map(sel => sel.code)
            .value();

        if (_.isEmpty(codes)) return [];

        const res = await api.metadata
            .get({
                optionSets: {
                    fields: {
                        id: true,
                        name: true,
                        code: true,
                        options: { code: true, displayName: true },
                    },
                    filter: { code: { in: codes } },
                },
            })
            .getData();

        return res.optionSets.map(
            (optionSet): OptionSet => ({
                ...optionSet,
                options: optionSet.options.map(option => ({
                    name: option.displayName,
                    value: option.code,
                })),
            })
        );
    }

    private static async getConstants(api: D2Api, storeConfig: DataFormStoreConfig["custom"]): Promise<Constant[]> {
        const codes = _(storeConfig.dataSets)
            .values()
            .map(x => (x.texts ? x.texts : undefined))
            .compact()
            .flatMap(t => [
                typeof t.header !== "string" ? t.header : undefined,
                typeof t.footer !== "string" ? t.footer : undefined,
            ])
            .compact()
            .map(selector => selector.code)
            .value();

        if (_.isEmpty(codes)) return [];

        const res = await api.metadata
            .get({
                constants: {
                    fields: { id: true, code: true, description: true },
                    filter: { code: { in: codes } },
                },
            })
            .getData();

        return res.constants;
    }

    getDataSetConfig(dataSet: DataSet): DataSetConfig {
        const dataSetConfig = this.config.custom.dataSets?.[dataSet.code];
        const viewType = dataSetConfig?.viewType;

        const sections = _(dataSetConfig?.sections)
            .toPairs()
            .map(([code, sectionConfig]) => {
                const section = dataSet.sections.find(section => section.code === code);
                return section
                    ? ([section.id, { viewType: getViewType(sectionConfig.viewType) }] as [Id, { viewType: ViewType }])
                    : undefined;
            })
            .compact()
            .fromPairs()
            .value();

        const { header, footer } = dataSetConfig?.texts || { header: "", footer: "" };
        const constantsByCode = _.keyBy(this.config.constants, getCode);

        const getText = (value: string | { code: string } | undefined) =>
            typeof value === "string" ? value : value ? constantsByCode[value.code]?.description : "";

        return {
            texts: { header: getText(header), footer: getText(footer) },
            viewType: getViewType(viewType),
            sections: sections,
        };
    }

    private getDataElementsConfig(): Record<Code, DataElementConfig> {
        return _(this.config.custom.dataElements)
            .toPairs()
            .map(([code, config]) => {
                const optionSetSelector = config?.selection;
                if (!optionSetSelector) return;

                const optionSetRef = optionSetSelector.optionSet;
                const optionSet = optionSetRef
                    ? this.config.optionSets.find(optionSet => selectorMatches(optionSet, optionSetRef))
                    : undefined;

                const dataElementConfig: DataElementConfig = {
                    selection: {
                        isMultiple: optionSetSelector.isMultiple || false,
                        optionSet: optionSet,
                        widget: optionSetSelector.widget,
                    },
                };

                return [code, dataElementConfig] as [typeof code, typeof dataElementConfig];
            })
            .compact()
            .fromPairs()
            .value();
    }
}

function getViewType(viewType: Maybe<string>): ViewType {
    return viewType && isElementOfUnion(viewType, DataFormM.viewTypes) ? viewType : "table";
}

function selectorMatches<T extends { code: string }>(obj: T, selector: Selector): boolean {
    return obj.code === selector.code;
}

interface Constant {
    id: Id;
    code: Code;
    description: string;
}
