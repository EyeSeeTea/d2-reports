import _ from "lodash";
import { Id } from "../common/entities/Base";
import { DataValue } from "../common/entities/DataValue";
import { DataSetRepository } from "../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../common/repositories/DataValuesRepository";
import { DataDiffItem } from "./mal-data-approval/entities/DataDiffItem";

export const dataSetApprovalName = "MAL - WMR Form-APVD";

export class WmrDiffReport {
    constructor(private dataValueRepository: DataValuesRepository, private dataSetRepository: DataSetRepository) {}

    async getDiff(dataSetId: Id, orgUnitId: Id, period: string, children = false): Promise<DataDiffItem[]> {
        const dataElements = await this.getDataElements(dataSetId);
        const dataSetApproval = await this.dataSetRepository.getByNameOrCode(dataSetApprovalName);
        const approvalDataValues = await this.getDataValues(dataSetApproval.id, orgUnitId, period, children);
        const malDataValues = await this.getDataValues(dataSetId, orgUnitId, period, children);

        const dataElementsWithValues = this.filterDataElementsWithDataValue(
            malDataValues,
            approvalDataValues,
            dataElements,
            dataSetId,
            orgUnitId,
            period
        );

        return dataElementsWithValues;
    }

    private async getDataValues(
        dataSetId: Id,
        orgUnitId: Id,
        period: string,
        children?: boolean
    ): Promise<DataValue[]> {
        const dataValues = await this.dataValueRepository.get({
            dataSetIds: [dataSetId],
            periods: [period],
            orgUnitIds: [orgUnitId],
            children: children,
        });
        return dataValues;
    }

    private async getDataElements(dataSetId: Id): Promise<DataElementsWithCombination[]> {
        const dataSets = await this.dataSetRepository.getById(dataSetId);
        const dataSet = _(dataSets).first();
        if (!dataSet) throw Error("No data set found");
        return dataSet.dataElements.flatMap(dataElement => {
            const combinations = dataElement.categoryCombo?.categoryOptionCombos || [];

            return combinations.map((combination): DataElementsWithCombination => {
                return {
                    dataValueId: `${dataElement.id}.${combination.id}`,
                    id: dataElement.id,
                    categoryOptionCombo: combination.id,
                    categoryOptionComboName: combination.name === "default" ? "" : combination.name,
                    name: dataElement.originalName,
                };
            });
        });
    }

    private filterDataElementsWithDataValue(
        malariaDataValues: DataValue[],
        approvalDataValues: DataValue[],
        dataElements: DataElementsWithCombination[],
        malariaDataSetId: Id,
        orgUnitId: Id,
        period: string
    ): DataDiffItem[] {
        return dataElements.flatMap(dataElement => {
            const matchingMalariaDataValues = malariaDataValues.filter(
                dataValue =>
                    dataValue.dataElement === dataElement.id &&
                    dataValue.categoryOptionCombo === dataElement.categoryOptionCombo
            );

            return _(matchingMalariaDataValues)
                .map(malariaDataValue => {
                    const approvalDataValue = approvalDataValues.find(
                        dataValue =>
                            dataValue.dataElement.toLowerCase() === dataElement.id.toLowerCase() &&
                            dataValue.categoryOptionCombo === dataElement.categoryOptionCombo &&
                            dataValue.orgUnit === malariaDataValue.orgUnit
                    );

                    if (!malariaDataValue.value && !approvalDataValue) return undefined;
                    if (malariaDataValue.value === approvalDataValue?.value) return undefined;

                    return {
                        dataSetUid: malariaDataSetId,
                        orgUnitUid: malariaDataValue?.orgUnit || orgUnitId,
                        period: period,
                        value: approvalDataValue && !malariaDataValue ? "" : malariaDataValue?.value,
                        dataElement: this.buildDataElementNameWithCombination(dataElement),
                        comment: malariaDataValue?.comment,
                        apvdDataElement: approvalDataValue?.dataElement,
                        apvdValue: approvalDataValue?.value,
                        apvdComment: approvalDataValue?.comment,
                        attributeOptionCombo: malariaDataValue?.attributeOptionCombo,
                        categoryOptionCombo: malariaDataValue?.categoryOptionCombo,
                        dataElementBasicName: dataElement.name,
                    };
                })
                .compact()
                .value();
        });
    }

    private buildDataElementNameWithCombination(dataElement: DataElementsWithCombination): string {
        return dataElement.categoryOptionComboName
            ? `${dataElement.name} - (${dataElement.categoryOptionComboName})`
            : dataElement.name;
    }
}

type DataElementsWithCombination = {
    dataValueId: string;
    id: Id;
    categoryOptionCombo: Id;
    categoryOptionComboName: string;
    name: string;
};
