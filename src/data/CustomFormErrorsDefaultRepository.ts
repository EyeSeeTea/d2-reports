import _ from "lodash";
import { CustomFormErrorsRepository } from "../domain/validatecustomforms/repositories/CustomFormErrorsRepository";
import i18n from "../locales";
import { D2Api } from "../types/d2-api";

export class CustomFormErrorsDefaultRepository implements CustomFormErrorsRepository {

    constructor(private api: D2Api) {}

    async get(id: string): Promise<string[]> {
        const dataSetMetadata : any = await this.api.metadata.d2Api
            .get(
                "/metadata.json?dataSets:fields=id,name,dataEntryForm[htmlCode],dataSetElements[dataElement[id,categoryCombo[id]&categoryCombos:fields=id,categoryOptionCombos"
            )
            .getData();
        const dataSets = dataSetMetadata["dataSets"];
        const dataSet = _.filter(dataSets, dataset => dataset.id === id)[0]
        const htmlCode = dataSet["dataEntryForm"]["htmlCode"];
        const newRegExp = new RegExp(/((([a-zA-Z0-9]){11})-(([a-zA-Z0-9]){11})-val)/g);

        const matches = htmlCode.match(newRegExp);

        const result = _.map(matches, match => {
            const groups = newRegExp.exec(match);
            if (groups) {
                return { dataElementId: groups[2], categoryOptionComboId: groups[4] };
            }
        });
        const errors = _.map(result, input => {
            if (input) {
                const categoryComboInDatasetElement = _.map(dataSet["dataSetElements"], dataelement => {
                    if (input && input["dataElementId"] === dataelement["dataElement"]["id"]) {
                        return dataelement["dataElement"]["categoryCombo"]["id"];
                    }
                });
                const categoryComboInDataElement = _.compact(categoryComboInDatasetElement);
                if (categoryComboInDataElement.length === 0) {
                    return (
                        i18n.t("ERROR dataelement with UID: ") +
                        input["dataElementId"] +
                        i18n.t(" does not exist in dataset with UID: ") +
                        id
                    );
                } else {
                    const categoryOptionComboInCategoryCombo = _.map(
                        dataSetMetadata["categoryCombos"],
                        categoryCombo => {
                            if (categoryComboInDataElement[0] === categoryCombo["id"]) {
                                const exist = _.map(categoryCombo["categoryOptionCombos"], categoryOptionCombo => {
                                    return categoryOptionCombo["id"] === input["categoryOptionComboId"];
                                });
                                return _.compact(exist);
                            } else {
                                return undefined;
                            }
                        }
                    );
                    const categoryComboOptionErrors = _.compact(categoryOptionComboInCategoryCombo)[0];
                    if (categoryComboOptionErrors?.length !== 1) {
                        return (
                            i18n.t("ERROR Dataelement with UID: ") +
                            input["dataElementId"] +
                            i18n.t(" is not associated with CategoryOptionComboID: ") +
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
