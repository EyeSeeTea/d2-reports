import _ from "lodash";
import { DataSetsRepository } from "../domain/validatecustomforms/repositories/DataSetsRepository";
import i18n from "../locales";
import { D2Api } from "../types/d2-api";

export class DataSetsDefaultRepository implements DataSetsRepository {
    constructor(private api: D2Api) {}

    async validate(id: string): Promise<string[]> {
        const metadata$ = this.api.metadata.get({
            dataSets: {
                fields: {
                    id: true,
                    displayName: true,
                    dataEntryForm: { htmlCode: true },
                    dataSetElements: {
                        dataElement: { id: true, categoryCombo: { id: true } },
                    },
                },
            },
            dataElements: {
                fields: { id: true, categoryCombo: { id: true } },
            },
            categoryCombos: {
                fields: { id: true, categoryOptionCombos: { id: true } },
            },
        });

        const { dataSets, categoryCombos } = await metadata$.getData();

        //map/find/filter
        //const dataSet = _.filter(dataSets, dataset => dataset.id === id)[0];
        //const dataSet = _.find(dataSets, dataset => dataset.id === id);
        const dataSet = dataSets.find(dataset => dataset.id === id);
        const htmlCode = dataSet?.dataEntryForm.htmlCode;
        const newRegExp = new RegExp(/((([a-zA-Z0-9]){11})-(([a-zA-Z0-9]){11})-val)/g);

        const matches = htmlCode?.match(newRegExp);

        const customFormIds = _(matches)
            .map(match => {
                const groups = newRegExp.exec(match);
                return groups ? { dataElementId: groups[2], categoryOptionComboId: groups[4] } : undefined;
            })
            .compact()
            .value();

        const categoryCombosById = _.keyBy(categoryCombos, cc => cc.id);

        // const objs: Record<DataElementId, CocId[]>

        const errors = _.map(customFormIds, input => {
            // const dataElement = dataElementsById[input.dataElementId];
            // const categoryCombo = categoryCombosById[dataElement.categoryCombo.id]
            // const isValid = categoryCombo.categoryOptionCombos.includes(input.categoryOptionComboId);

            const categoryComboInDatasetElement = _.map(dataSet?.dataSetElements, dataElement => {
                if (input.dataElementId === dataElement.dataElement.id) {
                    return dataElement.dataElement.categoryCombo.id;
                }
            });
            const categoryComboInDataElement = _.compact(categoryComboInDatasetElement);
            if (categoryComboInDataElement.length === 0) {
                return i18n.t(
                    "ERROR Dataelement with UID '{{dataElementId}}' does not exist in dataset with UID '{{dataSetId}}'",
                    { dataElementId: input.dataElementId, dataSetId: id, nsSeparator: false }
                );
            } else {
                const categoryOptionComboInCategoryCombo = _.map(categoryCombos, categoryCombo => {
                    if (categoryComboInDataElement[0] === categoryCombo.id) {
                        return _.map(categoryCombo.categoryOptionCombos, categoryOptionCombo => {
                            return categoryOptionCombo.id === input["categoryOptionComboId"];
                        });
                    }
                });
                const categoryComboOptionErrors = _.compact(_.compact(categoryOptionComboInCategoryCombo)[0]);
                if (categoryComboOptionErrors?.length !== 1) {
                    return (
                        i18n.t("ERROR Dataelement with UID:") +
                        " " +
                        input["dataElementId"] +
                        " " +
                        i18n.t("is not associated with CategoryOptionComboID:") +
                        " " +
                        input["categoryOptionComboId"]
                    );
                }
            }
        });
        const newerror = _.compact(errors);

        return _.uniq(newerror);
    }
}
