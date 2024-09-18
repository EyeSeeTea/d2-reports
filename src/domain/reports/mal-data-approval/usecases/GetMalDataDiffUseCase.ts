import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { Id } from "../../../common/entities/Base";
import { DataValue } from "../../../common/entities/DataValue";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { DataDiffItem } from "../entities/DataDiffItem";
import { MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";

type GetDataDiffUseCaseOptions = MalDataApprovalOptions;
const dataSetApprovalName = "MAL - WMR Form-APVD";

export class GetMalDataDiffUseCase implements UseCase {
    constructor(private dataValueRepository: DataValuesRepository, private dataSetRepository: DataSetRepository) {}

    async execute(options: GetDataDiffUseCaseOptions): Promise<PaginatedObjects<DataDiffItem>> {
        const malariaDataSetId = _(options.dataSetIds).first();
        const orgUnitId = _(options.orgUnitIds).first();
        const period = _(options.periods).first();
        if (!malariaDataSetId) throw Error("No malaria data set ID provided");
        if (!orgUnitId) throw Error("No org unit ID provided");
        if (!period) throw Error("No period provided");

        const dataElements = await this.getDataElements(malariaDataSetId);
        const dataSetApproval = await this.dataSetRepository.getByNameOrCode(dataSetApprovalName);
        const approvalDataValues = await this.getDataValues(dataSetApproval.id, options);
        const malDataValues = await this.getDataValues(malariaDataSetId, options);

        const dataElementsWithValues = this.filterDataElementsWithDataValue(
            malDataValues,
            approvalDataValues,
            dataElements,
            malariaDataSetId,
            orgUnitId,
            period
        );

        return {
            objects: dataElementsWithValues,
            pager: {
                pageCount: 1,
                page: 1,
                pageSize: 10,
                total: dataElementsWithValues.length,
            },
        };
    }

    private async getDataValues(dataSetId: Id, options: GetDataDiffUseCaseOptions) {
        const dataValues = await this.dataValueRepository.get({
            dataSetIds: [dataSetId],
            periods: options.periods,
            orgUnitIds: options.orgUnitIds,
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
