import _ from "lodash";
import { DataValue } from "../domain/entities/DataValue";
import { DataValueRepository, GetOptions } from "../domain/repositories/DataValueRepository";
import { D2Api, DataValueSetsDataValue, DataValueSetsGetRequest, Id } from "../types/d2-api";
import { getId, NamedRef } from "../domain/entities/Base";

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(options: GetOptions): Promise<DataValue[]> {
        const { config } = options;
        const { api } = this;
        const dataSetIds = options.dataSets;

        const params: DataValueSetsGetRequest = {
            dataSet: _.isEmpty(dataSetIds)
                ? _.values(config.dataSets).map(ds => ds.id)
                : dataSetIds,
            period: options.periods,
            orgUnit: options.orgUnitIds,
            children: true,
            lastUpdated: "1970",
            limit: 10,
        };
        const { dataValues: d2DataValues } = await api.dataValues.getSet(params).getData();

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const metadata = await getMetadata(api, { dataSetIds, d2DataValues });

        const dataValues: Array<DataValue> = d2DataValues.map(
            (dv): DataValue => ({
                id: getDataValueId(dv),
                period: dv.period,
                orgUnit: metadata.organisationUnits.get(dv.orgUnit),
                dataSets: metadata.dataSets.get(dv.dataElement),
                dataElement: metadata.dataElements.get(dv.dataElement),
                categoryOptionCombo: metadata.categoryOptionCombos.get(dv.categoryOptionCombo),
                value: dv.value,
                comment: dv.comment,
                lastUpdated: new Date(dv.lastUpdated),
                storedBy: dv.storedBy,
            })
        );

        return dataValues;
    }
}

function getDataSetNameByDataElementId(dataSetMetadata: DataSetMetadata[]): Record<Id, NamedRef[]> {
    return _(dataSetMetadata)
        .flatMap(dataSet =>
            dataSet.dataSetElements.map(dse => ({
                dataSet: { id: dataSet.id, name: dataSet.displayName },
                dataElement: dse.dataElement,
            }))
        )
        .groupBy(dse => dse.dataElement.id)
        .mapValues(dses => dses.map(dse => dse.dataSet))
        .value();
}

function getDataValueId(dv: DataValueSetsDataValue) {
    return [dv.dataElement, dv.period, dv.categoryOptionCombo, dv.attributeOptionCombo].join("-");
}

interface Metadata {
    organisationUnits: { get(id: string): NamedRef };
    dataElements: { get(id: string): NamedRef };
    categoryOptionCombos: { get(id: string): NamedRef };
    dataSets: { get(dataElementId: string): NamedRef[] };
}

interface DataSetMetadata {
    id: Id;
    displayName: string;
    dataSetElements: Array<{ dataElement: { id: Id } }>;
}

async function getMetadata(
    api: D2Api,
    options: { dataSetIds: Id[]; d2DataValues: DataValueSetsDataValue[] }
): Promise<Metadata> {
    const { dataSetIds, d2DataValues } = options;
    const [orgUnitIds, dataElementIds, cocIds] = _(d2DataValues)
        .map(dv => [dv.orgUnit, dv.dataElement, dv.categoryOptionCombo] as const)
        .unzip()
        .value();

    const toName = { $fn: { name: "rename", to: "name" } } as const;

    const objs = await api.metadata
        .get({
            organisationUnits: {
                fields: { id: true, displayName: toName },
                // TODO: 'in' filters can hit a 414 uri-too-long, can be it be implemented in d2-api?
                filter: { id: { in: _.uniq(orgUnitIds) } },
            },
            dataElements: {
                fields: { id: true, displayName: toName },
                filter: { id: { in: _.uniq(dataElementIds) } },
            },
            categoryOptionCombos: {
                fields: { id: true, displayName: toName },
                filter: { id: { in: _.uniq(cocIds) } },
            },
            dataSets: {
                fields: {
                    id: true,
                    displayName: true,
                    dataSetElements: { dataElement: { id: true } },
                },
                filter: { id: { in: dataSetIds } },
            },
        })
        .getData();

    const dataSetNameByDataElementId = getDataSetNameByDataElementId(objs.dataSets);

    return {
        organisationUnits: indexable(objs.organisationUnits, getId),
        dataElements: indexable(objs.dataElements, getId),
        categoryOptionCombos: indexable(objs.categoryOptionCombos, getId),
        dataSets: {
            get(dataElementId: Id) {
                return dataSetNameByDataElementId[dataElementId] || [];
            },
        },
    };
}

function indexable<Obj extends NamedRef>(objs: Obj[], getId: (obj: Obj) => string) {
    const objsByKey = _.keyBy(objs, getId);
    return {
        get: (id: string) => objsByKey[id] || { id: id, name: id },
    };
}
