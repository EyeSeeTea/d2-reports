import _ from "lodash";
import { DataValue } from "../domain/entities/DataValue";
import { DataValueRepository } from "../domain/repositories/DataValueRepository";
import { D2Api, DataValueSetsDataValue } from "../types/d2-api";
import { getId, NamedRef } from "../domain/entities/Base";

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<DataValue[]> {
        const { dataValues: d2DataValues } = await this.api.dataValues
            .getSet({
                dataSet: ["Tu81BTLUuCT"],
                orgUnit: ["H8RixfF8ugH"],
                children: true,
                lastUpdated: "1970",
                limit: 5,
            })
            .getData();

        // A data value is not associated to specific data set, but we can still map them
        // using its data element (1 data value -> 1 data element -> N data sets).

        const metadata = await getMetadata(this.api, d2DataValues);

        const dataValues: Array<DataValue> = d2DataValues.map(
            (dv): DataValue => {
                const dataSet = { id: "todo1", name: "TODO" };
                const id = [
                    dv.dataElement,
                    dv.period,
                    dv.categoryOptionCombo,
                    dv.attributeOptionCombo,
                ].join("-");

                return {
                    id,
                    period: dv.period,
                    orgUnit: metadata.organisationUnits.get(dv.orgUnit),
                    dataSet,
                    dataElement: metadata.dataElements.get(dv.dataElement),
                    categoryOptionCombo: metadata.categoryOptionCombos.get(dv.categoryOptionCombo),
                    value: dv.value,
                    comment: dv.comment,
                    lastUpdated: new Date(dv.lastUpdated),
                    storedBy: metadata.users.get(dv.storedBy),
                };
            }
        );

        return _.compact(dataValues);
    }
}

async function getMetadata(api: D2Api, d2DataValues: DataValueSetsDataValue[]) {
    const [orgUnitIds, dataElementIds, cocIds, usernames] = _(d2DataValues)
        .map(dv => [dv.orgUnit, dv.dataElement, dv.categoryOptionCombo, dv.storedBy] as const)
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
            users: {
                fields: { id: true, displayName: toName, userCredentials: { username: true } },
                filter: { "userCredentials.username": { in: _.uniq(usernames) } },
            },
        })
        .getData();

    return {
        organisationUnits: indexable(objs.organisationUnits, getId),
        dataElements: indexable(objs.dataElements, getId),
        categoryOptionCombos: indexable(objs.categoryOptionCombos, getId),
        users: indexable(objs.users, user => user.userCredentials.username),
    };
}

function indexable<Obj extends NamedRef>(objs: Obj[], getKey: (obj: Obj) => string) {
    const objsByKey = _.keyBy(objs, getKey);
    return {
        get: (key: string) => objsByKey[key] || { id: key, name: key },
    };
}
