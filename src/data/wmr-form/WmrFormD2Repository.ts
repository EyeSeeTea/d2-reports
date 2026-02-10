import { D2Api } from "../../types/d2-api";
import { WmrFormRepository } from "../../domain/wmr-form/repositories/WmrFormRepository";
import { WmrForm } from "../../domain/wmr-form/entities/WmrForm";
import { Id } from "../../domain/common/entities/Base";
import { PersistOptions } from "../../domain/wmr-form/repositories/WmrQuestionRepository";
import { generateMetadataOptions } from "./WmrQuestionD2Repository";
import { writeFileSync } from "fs";

export class WmrFormD2Repository implements WmrFormRepository {
    constructor(private api: D2Api) {}

    async getById(id: string): Promise<WmrForm> {
        const response = await this.api.models.dataSets
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    dataSetElements: { dataElement: { id: true }, categoryCombo: { id: true } },
                },
                filter: { id: { eq: id } },
            })
            .response();

        const d2DataSet = response.data.objects[0];
        if (!d2DataSet) throw new Error(`DataSet with id ${id} not found`);
        const defaultCategoryCombo = await this.getDefaultCategoryCombo();

        return {
            id: d2DataSet.id,
            name: d2DataSet.displayName,
            questionRefs: d2DataSet.dataSetElements.map(element => ({
                questionId: element.dataElement.id,
                combinationId: element.categoryCombo ? element.categoryCombo.id : defaultCategoryCombo,
            })),
        };
    }

    private async getDefaultCategoryCombo(): Promise<Id> {
        const response = await this.api.models.categoryCombos
            .get({ fields: { id: true }, filter: { name: { eq: "default" } } })
            .getData();

        const defaultCategoryCombo = response.objects[0];
        if (!defaultCategoryCombo) throw new Error("Default category combo not found");

        return defaultCategoryCombo.id;
    }

    async save(form: WmrForm, options: PersistOptions): Promise<void> {
        const { objects } = await this.api.models.dataSets
            .get({ fields: { $owner: true }, filter: { id: { eq: form.id } }, paging: false })
            .getData();

        const d2DataSet = objects[0];

        const dataElementsToAdd = form.questionRefs.map(element => ({
            dataSet: { id: form.id },
            dataElement: { id: element.questionId },
            categoryCombo: { id: element.combinationId },
        }));

        const dataSetToSave = { ...(d2DataSet || {}), dataSetElements: dataElementsToAdd };

        if (options.export) {
            const currentDate = new Date().toISOString();
            writeFileSync(
                `metadata_dataSets_${currentDate}.json`,
                JSON.stringify({ dataSets: dataSetToSave }, null, 2)
            );
        }

        const response = await this.api.metadata
            .post({ dataSets: [dataSetToSave] }, generateMetadataOptions(options))
            .getData();
        console.debug("dataSets response", response.stats);
    }
}
