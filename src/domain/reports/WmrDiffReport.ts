import _ from "lodash";
import { Id } from "../common/entities/Base";
import { DataValue } from "../common/entities/DataValue";
import { DataSetRepository } from "../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../common/repositories/DataValuesRepository";
import { DataDiffItem } from "./mal-data-approval/entities/DataDiffItem";

const dataSetApprovalName = "MAL - WMR Form-APVD";

export class WmrDiffReport {
    constructor(private dataValueRepository: DataValuesRepository, private dataSetRepository: DataSetRepository) {}

    async getDiff(dataSetId: Id, orgUnitId: Id, period: string) {
        const dataElements = await this.getDataElements(dataSetId);
        const dataSetApproval = await this.dataSetRepository.getByNameOrCode(dataSetApprovalName);
        const approvalDataValues = await this.getDataValues(dataSetApproval.id, orgUnitId, period);
        const malDataValues = await this.getDataValues(dataSetId, orgUnitId, period);

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

    private async getDataValues(dataSetId: Id, orgUnitId: Id, period: string): Promise<DataValue[]> {
        const dataValues = await this.dataValueRepository.get({
            dataSetIds: [dataSetId],
            periods: [period],
            orgUnitIds: [orgUnitId],
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
        return _(dataElements)
            .map(dataElement => {
                const malariaDataValue = _(malariaDataValues).find(
                    dataValue =>
                        dataValue.dataElement === dataElement.id &&
                        dataValue.categoryOptionCombo === dataElement.categoryOptionCombo
                );

                const approvalDataValue = _(approvalDataValues).find(
                    dataValue =>
                        dataValue.dataElement.toLowerCase() === dataElement.id.toLowerCase() &&
                        dataValue.categoryOptionCombo === dataElement.categoryOptionCombo
                );

                if (!malariaDataValue && !approvalDataValue) return undefined;
                if (malariaDataValue?.value === approvalDataValue?.value) return undefined;

                return {
                    dataSetUid: malariaDataSetId,
                    orgUnitUid: orgUnitId,
                    period: period,
                    value: malariaDataValue?.value,
                    dataElement: this.buildDataElementNameWithCombination(dataElement),
                    comment: malariaDataValue?.comment,
                    apvdDataElement: approvalDataValue?.dataElement,
                    apvdValue: approvalDataValue?.value,
                    apvdComment: approvalDataValue?.comment,
                };
            })
            .compact()
            .value();
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
