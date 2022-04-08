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
            categoryCombos: { fields: { id: true, categoryOptionCombos: { id: true } } },
        });

        const data = await metadata$.getData();

        const dataSets = data.dataSets;
        //const dataSet = _.filter(dataSets, dataset => dataset.id === id)[0];
        const dataSet = dataSets.find(dataset => dataset.id === id);
        const htmlCode = dataSet?.dataEntryForm.htmlCode;
        const newRegExp = new RegExp(/((([a-zA-Z0-9]){11})-(([a-zA-Z0-9]){11})-val)/g);

        const matches = htmlCode?.match(newRegExp);

        const result = _.map(matches, match => {
            const groups = newRegExp.exec(match);
            if (groups) {
                return { dataElementId: groups[2], categoryOptionComboId: groups[4] };
            }
        });
        const errors = _.map(result, input => {
            if (input) {
                const categoryComboInDatasetElement = _.map(dataSet?.dataSetElements, dataelement => {
                    if (input && input["dataElementId"] === dataelement.dataElement.id) {
                        return dataelement.dataElement.categoryCombo.id;
                    }
                });
                const categoryComboInDataElement = _.compact(categoryComboInDatasetElement);
                if (categoryComboInDataElement.length === 0) {
                    return (
                        i18n.t("ERROR Dataelement with UID:") +
                        " " +
                        input["dataElementId"] +
                        " " +
                        i18n.t("does not exist in dataset with UID:") +
                        " " +
                        id
                    );
                } else {
                    const categoryOptionComboInCategoryCombo = _.map(data.categoryCombos, categoryCombo => {
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
            }
        });
        const newerror = _.compact(errors);

        return _.uniq(newerror);
    }
}
