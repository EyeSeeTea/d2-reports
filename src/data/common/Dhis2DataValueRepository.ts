import _ from "lodash";
import { getId, Id } from "../../domain/common/entities/Base";
import { DataElement } from "../../domain/common/entities/DataElement";
import { DataValue, DataValueFile, DateObj, FileResource, Period } from "../../domain/common/entities/DataValue";
import { DataValueRepository } from "../../domain/common/repositories/DataValueRepository";
import { D2Api, DataValueSetsDataValue } from "../../types/d2-api";
import { promiseMap } from "../../utils/promises";
import { assertUnreachable, Maybe } from "../../utils/ts-utils";
import { Dhis2DataElement } from "./Dhis2DataElement";

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(options: { dataSetId: Id; orgUnitId: Id; periods: Period[] }): Promise<DataValue[]> {
        const { dataValues } = await this.api.dataValues
            .getSet({
                dataSet: [options.dataSetId],
                orgUnit: [options.orgUnitId],
                period: options.periods,
            })
            .getData();

        const dataElements = await this.getDataElements(dataValues);

        const dataValuesFiles = await this.getFileResourcesMapping(dataElements, dataValues);

        return _(dataValues)
            .map((dv): DataValue | null => {
                const dataElement = dataElements[dv.dataElement];
                if (!dataElement) {
                    console.error(`Data element not found: ${dv.dataElement}`);
                    return null;
                }

                const selector = {
                    orgUnitId: dv.orgUnit,
                    period: dv.period,
                    categoryOptionComboId: dv.categoryOptionCombo,
                };

                const isMultiple = dataElement.options?.isMultiple;
                const { type } = dataElement;

                switch (type) {
                    case "TEXT":
                        return isMultiple
                            ? { type: "TEXT", isMultiple: true, dataElement, values: getValues(dv.value), ...selector }
                            : {
                                  type: "TEXT",
                                  isMultiple: false,
                                  dataElement,
                                  value: dv.value,
                                  ...selector,
                              };
                    case "NUMBER":
                        return isMultiple
                            ? {
                                  type: "NUMBER",
                                  isMultiple: true,
                                  dataElement,
                                  values: getValues(dv.value),
                                  ...selector,
                              }
                            : {
                                  type: "NUMBER",
                                  isMultiple: false,
                                  dataElement,
                                  value: dv.value,
                                  ...selector,
                              };
                    case "BOOLEAN":
                        return {
                            type: "BOOLEAN",
                            isMultiple: false,
                            dataElement,
                            value: dv.value === "true",
                            ...selector,
                        };
                    case "FILE":
                        return {
                            type: "FILE",
                            dataElement,
                            file: dataValuesFiles[dv.value],
                            isMultiple: false,
                            ...selector,
                        };
                    case "DATE": {
                        const [year, month, day] = (dv.value || "").split("-").map(s => parseInt(s));
                        const value: Maybe<DateObj> = year && month && day ? { year, month, day } : undefined;

                        return {
                            type: "DATE",
                            dataElement,
                            value: value,
                            isMultiple: false,
                            ...selector,
                        };
                    }
                    default:
                        assertUnreachable(type);
                }
            })
            .compact()
            .value();
    }

    private async getFileResourcesMapping(
        dataElements: Record<Id, DataElement>,
        dataValues: DataValueSetsDataValue[]
    ): Promise<Record<Id, FileResource>> {
        const fileResources = await promiseMap(dataValues, async dataValue => {
            const dataElement = dataElements[dataValue.dataElement];
            if (dataElement?.type !== "FILE") return undefined;

            return this.api
                .get<D2FileResource>(`/fileResources/${dataValue.value}`)
                .getData()
                .then(
                    (fileResource): FileResource => ({
                        id: fileResource.id,
                        name: fileResource.displayName,
                        size: fileResource.contentLength,
                        url: this.getUrl({
                            dataElementId: dataElement.id,
                            categoryOptionComboId: dataValue.categoryOptionCombo,
                            orgUnitId: dataValue.orgUnit,
                            period: dataValue.period,
                        }),
                    })
                )
                .catch(() => undefined);
        });

        return _(fileResources).compact().keyBy(getId).value();
    }

    private getUrl(options: { dataElementId: Id; categoryOptionComboId: Id; orgUnitId: Id; period: Period }): string {
        return (
            `${this.api.baseUrl}/api/dataValues/files?` +
            new URLSearchParams({
                de: options.dataElementId,
                co: options.categoryOptionComboId,
                ou: options.orgUnitId,
                pe: options.period,
            }).toString()
        );
    }

    private async getDataElements(dataValues: DataValueSetsDataValue[]) {
        const dataElementIds = dataValues.map(dv => dv.dataElement);
        return new Dhis2DataElement(this.api).get(dataElementIds);
    }

    async save(dataValue: DataValue): Promise<DataValue> {
        const valueStr = this.getStrValue(dataValue);
        const { type } = dataValue;

        switch (type) {
            case "FILE": {
                const { fileToSave } = dataValue;

                if (fileToSave) {
                    return this.saveFileDataValue(dataValue, fileToSave);
                } else {
                    return this.deleteFileDataValue(dataValue);
                }
            }
            default:
                return this.api.dataValues
                    .post({
                        ou: dataValue.orgUnitId,
                        pe: dataValue.period,
                        de: dataValue.dataElement.id,
                        value: valueStr,
                    })
                    .getData()
                    .then(() => dataValue);
        }
    }

    private async deleteFileDataValue(dataValue: DataValueFile): Promise<DataValue> {
        await this.api
            .request<unknown>({
                method: "delete",
                url: "/dataValues",
                params: {
                    ou: dataValue.orgUnitId,
                    pe: dataValue.period,
                    de: dataValue.dataElement.id,
                },
            })
            .getData();

        return { ...dataValue, file: undefined, fileToSave: undefined };
    }

    private async saveFileDataValue(dataValue: DataValueFile, fileToSave: File): Promise<DataValueFile> {
        const obj = {
            ou: dataValue.orgUnitId,
            pe: dataValue.period,
            de: dataValue.dataElement.id,
            file: fileToSave,
        };

        const formData = new FormData();
        _.forEach(obj, (value, key) => formData.append(key, value));

        const res = await this.api
            .request<D2PostFileResource>({
                method: "post",
                url: "/dataValues/file",
                data: formData,
                requestBodyType: "raw",
            })
            .getData();

        const resource = res.response.fileResource;
        const fileResource: FileResource = {
            id: resource.id,
            name: resource.displayName,
            size: resource.contentLength,
            url: this.getUrl({
                dataElementId: dataValue.dataElement.id,
                categoryOptionComboId: dataValue.categoryOptionComboId,
                orgUnitId: dataValue.orgUnitId,
                period: dataValue.period,
            }),
        };

        return { ...dataValue, file: fileResource, fileToSave: undefined };
    }

    private getStrValue(dataValue: DataValue): string {
        switch (dataValue.type) {
            case "BOOLEAN":
                return dataValue.value
                    ? "true"
                    : dataValue.value === false && !dataValue.dataElement.isTrueOnly
                    ? "false"
                    : "";
            case "NUMBER":
            case "TEXT":
                return (dataValue.isMultiple ? dataValue.values.join("; ") : dataValue.value) || "";
            case "FILE":
                return dataValue.file?.id || "";
            case "DATE": {
                const val = dataValue.value;
                return val ? [val.year, pad2(val.month), pad2(val.day)].join("-") : "";
            }
        }
    }
}

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

function getValues(s: string): string[] {
    return _(s)
        .split(";")
        .map(s => s.trim())
        .compact()
        .value();
}

interface D2FileResource {
    id: Id;
    displayName: string;
    contentLength: number;
}

interface D2PostFileResource {
    response: { fileResource: D2FileResource };
}
