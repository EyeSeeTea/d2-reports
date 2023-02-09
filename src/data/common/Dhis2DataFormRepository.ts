import _ from "lodash";
import { Id } from "../../domain/common/entities/Base";
import {
    DataElementM,
    DataForm,
    DataFormValue,
    Period,
    Section,
    SubSection,
} from "../../domain/common/entities/DataForm";
import { DataFormRepository } from "../../domain/common/repositories/DataFormRepository";
import { D2Api } from "../../types/d2-api";
import { isElementOfUnion } from "../../utils/ts-utils";

export class Dhis2DataFormRepository implements DataFormRepository {
    constructor(private api: D2Api) {}

    async get(options: { id: Id; orgUnitId: Id; period: Period }): Promise<DataForm> {
        const res = await this.api.metadata
            .get({
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
                            },
                        },
                    },
                    filter: { id: { eq: options.id } },
                },
            })
            .getData();

        const dataSet = res.dataSets[0];
        if (!dataSet) return Promise.reject(new Error("Data set not found"));
        console.log({ dataSet });

        return {
            id: dataSet.id,
            options: [],
            optionSets: [],
            sections: dataSet.sections.map((section): Section => {
                return {
                    id: section.id,
                    name: section.displayName,
                    subsections: _(section.dataElements)
                        .groupBy(dataElement => _(dataElement.formName).split(" - ").initial().join(" - "))
                        .toPairs()
                        .map(
                            ([groupName, dataElementsForGroup]): SubSection => ({
                                name: groupName,
                                dataElements: _(dataElementsForGroup)
                                    .map(dataElement => {
                                        const { valueType } = dataElement;

                                        if (isElementOfUnion(valueType, DataElementM.valueTypesSupported)) {
                                            return {
                                                ...dataElement,
                                                valueType,
                                                name: _(dataElement.formName).split(" - ").last() || "-",
                                            };
                                        } else {
                                            console.error(
                                                `Data element $de.name (id=${dataElement.id}, valueType=${dataElement.valueType}) skipped, valueType is not supported`
                                            );
                                            return null;
                                        }
                                    })
                                    .compact()
                                    .value(),
                            })
                        )
                        .value(),
                };
            }),
        };
    }

    async getValues(options: { id: Id; orgUnitId: Id; period: Period }): Promise<DataFormValue[]> {
        const res = await this.api.dataValues
            .getSet({ dataSet: [options.id], orgUnit: [options.orgUnitId], period: [options.period] })
            .getData();

        return res.dataValues.map(
            (dv): DataFormValue => ({
                dataElementId: dv.dataElement,
                value: dv.value,
                orgUnitId: dv.orgUnit,
                period: dv.period,
                categoryOptionComboId: dv.categoryOptionCombo,
            })
        );
    }

    async saveValue(dataValue: DataFormValue): Promise<void> {
        const strValue = typeof dataValue.value === "number" ? dataValue.value.toString() : dataValue.value;

        return this.api.dataValues
            .post({
                ou: dataValue.orgUnitId,
                pe: dataValue.period,
                de: dataValue.dataElementId,
                value: strValue,
            })
            .getData();
    }
}
