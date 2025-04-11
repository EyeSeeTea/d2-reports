import _ from "lodash";
import { D2Api, PostOptions } from "../../types/d2-api";
import { WmrQuestion } from "../../domain/wmr-form/entities/WmrQuestion";
import { PersistOptions, WmrQuestionRepository } from "../../domain/wmr-form/repositories/WmrQuestionRepository";
import { promiseMap } from "../../utils/promises";
import { Id } from "../../domain/common/entities/Base";
import { writeFileSync } from "fs";

export class WmrQuestionD2Repository implements WmrQuestionRepository {
    constructor(private api: D2Api) {}

    async getByIds(ids: string[]): Promise<WmrQuestion[]> {
        const allDataElements = await promiseMap(_.chunk(ids, CHUNK_SIZE), async dataElementIds => {
            const { objects } = await this.api.models.dataElements
                .get({
                    fields: { id: true, name: true, shortName: true, code: true, categoryCombo: { id: true } },
                    filter: { id: { in: dataElementIds } },
                    paging: false,
                })
                .getData();
            return objects.map(d2DataElement => ({
                ...d2DataElement,
                combinationId: d2DataElement.categoryCombo.id,
            }));
        });
        return allDataElements.flat();
    }

    async clone(questions: WmrQuestion[], idsToClone: Id[], options: PersistOptions): Promise<void> {
        if (questions.length === 0 || idsToClone.length === 0) return Promise.resolve();

        const dataElementsToClone = await promiseMap(_.chunk(idsToClone, CHUNK_SIZE), async dataElementIds => {
            const { objects } = await this.api.models.dataElements
                .get({ fields: { $owner: true }, filter: { id: { in: dataElementIds } }, paging: false })
                .getData();
            return objects;
        });

        const allDataElementsToClone = dataElementsToClone.flat();
        const dataElementsById = _(allDataElementsToClone)
            .keyBy(dataElement => dataElement.id.toUpperCase())
            .value();

        const onlyQuestionsInCloneIds = questions.filter(question => Boolean(dataElementsById[question.id]));

        await promiseMap(_.chunk(onlyQuestionsInCloneIds, CHUNK_SIZE), async questionsChunk => {
            const d2DataElementsToSave = questionsChunk.map(question => {
                const existinDataElement = dataElementsById[question.id];
                const d2DataElementToSave = {
                    ...(existinDataElement || {}),
                    id: question.id,
                    name: question.name,
                    shortName: question.shortName,
                    code: question.code,
                };
                return d2DataElementToSave;
            });

            if (options.export) {
                const currentDate = new Date().toISOString();
                writeFileSync(
                    `metadata_dataElements_${currentDate}.json`,
                    JSON.stringify({ dataElements: d2DataElementsToSave }, null, 2)
                );
            }

            const response = await this.api.metadata
                .post({ dataElements: d2DataElementsToSave }, generateMetadataOptions(options))
                .getData();
            console.debug("dataElements response", response.stats);
        });
    }
}

const CHUNK_SIZE = 100;

export function generateMetadataOptions(options: PersistOptions): Partial<PostOptions> {
    return { importMode: options.persist ? "COMMIT" : "VALIDATE", skipValidation: !options.persist };
}
