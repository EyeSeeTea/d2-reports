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

        const { dataSets, categoryCombos, dataElements } = await metadata$.getData();

        const dataSet = dataSets.find(dataset => dataset.id === id);
        const htmlCode = dataSet?.dataEntryForm.htmlCode;
        const newRegExp = new RegExp(/(([a-zA-Z0-9]){11})-(([A-Za-zA-Z0-9]){11})-(val)/g);

        const matches = htmlCode?.match(newRegExp);
        const customFormIds = _(matches).map(item => {
            return { dataElementId: item.split("-")[0] ?? "-", categoryOptionComboId: item.split("-")[1] ?? "-" };
        }).commit().value();

        const categoryCombosById = _.keyBy(categoryCombos, cc => cc.id);
        const dataElementsDataSetById = _.keyBy(dataSet?.dataSetElements, cc => cc.dataElement.id);
        const dataElementsById = _.keyBy(dataElements, cc => cc.id);

        const errors = _.map(customFormIds, dataElementFromCustomForm => {
            const dataElement = dataElementsDataSetById[dataElementFromCustomForm.dataElementId]?.dataElement;
            if (dataElement) {
                const categoryCombo =
                    dataElement.categoryCombo.id ??
                    dataElementsById[dataElementFromCustomForm.dataElementId]?.categoryCombo.id;
                const isValid = categoryCombosById[categoryCombo ?? ""]?.categoryOptionCombos.find(
                    coc => coc.id === dataElementFromCustomForm.categoryOptionComboId
                );
                if (!isValid) {
                    return (
                        i18n.t("ERROR Dataelement with UID:") +
                        " " +
                        dataElementFromCustomForm["dataElementId"] +
                        " " +
                        i18n.t("is not associated with CategoryOptionComboID:") +
                        " " +
                        dataElementFromCustomForm["categoryOptionComboId"]
                    );
                }
            } else {
                return i18n.t(
                    "ERROR Dataelement with UID '{{dataElementId}}' does not exist in dataset with UID '{{dataSetId}}'",
                    { dataElementId: dataElementFromCustomForm.dataElementId, dataSetId: id, nsSeparator: false }
                );
            }
        });
        const newerror = _.compact(errors);

        return _.uniq(newerror);
    }
}
