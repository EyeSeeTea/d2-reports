import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../contexts/app-context";

import { DataForm, DataFormM } from "../../../domain/common/entities/DataForm";
import {
    DataValue,
    DataValueNumberSingle,
    DataValueStore,
    DataValueTextMultiple,
    Period,
} from "../../../domain/common/entities/DataValue";
import { useDataEntrySelector } from "./useDataEntrySelector";
import i18n from "@eyeseetea/d2-ui-components/locales";
import GridForm from "./GridForm";
import { assertUnreachable, Maybe } from "../../../utils/ts-utils";
import { Id } from "../../../domain/common/entities/Base";
import TableForm from "./TableForm";
import SectionsTabs from "./SectionsTabs";
import { useBooleanState } from "../../utils/use-boolean";
import { LinearProgress } from "@material-ui/core";
import GridWithPeriods from "./GridWithPeriods";
import { Html } from "./Html";
import _ from "lodash";
import GridWithTotals from "./GridWithTotals";
import GridWithCombos from "./GridWithCombos";
import { DataElementRefType } from "../../../domain/common/repositories/DataValueRepository";
import { DataElement } from "../../../domain/common/entities/DataElement";
import { Row } from "./GridWithTotalsViewModel";

const AutogeneratedForm: React.FC = () => {
    const [dataFormInfo, isLoading] = useDataFormInfo();
    if (!dataFormInfo) return <div>{i18n.t("Loading...")}</div>;
    const { dataForm } = dataFormInfo.metadata;

    if (dataForm.sections.length === 0)
        return <p>{i18n.t("There are no sections in this data set. Check README for more details")}</p>;

    const tabSectionsMap = _.orderBy(
        dataForm.sections.flatMap(section => {
            const { tabs } = section;
            if (tabs.active === true) {
                return section;
            } else {
                return [];
            }
        }),
        ["tabs.order"],
        ["asc"]
    );

    const sectionsMap = dataForm.sections.flatMap(section => {
        const { tabs } = section;
        if (tabs.active === false) {
            return section;
        } else {
            return [];
        }
    });

    return (
        <div ref={dataFormInfo.initForm}>
            {<LinearProgress style={isLoading ? styles.visible : styles.invisible} />}

            <CommentDialogStyles />

            <Html content={dataForm.texts.header} />

            <div key={dataFormInfo.period + "tabs"}>
                <SectionsTabs dataFormInfo={dataFormInfo} sections={tabSectionsMap} />
            </div>

            <div key={dataFormInfo.period}>
                {sectionsMap.map(section => {
                    const { viewType } = section;
                    switch (viewType) {
                        case "table":
                            return <TableForm key={section.id} dataFormInfo={dataFormInfo} section={section} />;
                        case "grid":
                            return <GridForm key={section.id} dataFormInfo={dataFormInfo} section={section} />;
                        case "grid-with-periods":
                            return <GridWithPeriods key={section.id} dataFormInfo={dataFormInfo} section={section} />;
                        case "grid-with-totals":
                            return (
                                <GridWithTotals
                                    key={`${section.id}+tab`}
                                    dataFormInfo={dataFormInfo}
                                    section={section}
                                />
                            );
                        case "grid-with-combos":
                            return <GridWithCombos key={section.id} dataFormInfo={dataFormInfo} section={section} />;
                        default:
                            assertUnreachable(viewType);
                    }
                })}
            </div>

            <Html content={dataForm.texts.footer} />
        </div>
    );
};

function useDataFormInfo(): [Maybe<DataFormInfo>, boolean] {
    const { compositionRoot, config } = useAppContext();
    const { orgUnitId, period, dataSetId, reloadKey, initForm } = useDataEntrySelector();
    const [dataForm, setDataForm] = useState<DataForm>();
    const [dataValues, setDataValues] = useState<DataValueStore>();
    const [isLoading, loadingActions] = useBooleanState(false);

    const defaultCategoryOptionComboId = config.categoryOptionCombos.default.id;

    React.useEffect(() => {
        // Hiding arrows for input of type number
        // adding directly to css works in dev, but not in data entry.
        const css =
                "input::-webkit-outer-spin-button,input::-webkit-inner-spin-button {-webkit-appearance: none !important; margin: 0; } input[type=number] { -moz-appearance: textfield !important; }",
            head = document.head || document.getElementsByTagName("head")[0],
            style = document.createElement("style");
        style.setAttribute("id", "disabled-arrows-css");
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }, []);

    useEffect(() => {
        compositionRoot.dataForms.get({ dataSetId, period }).then(setDataForm);
    }, [compositionRoot, dataSetId, period]);

    useEffect(() => {
        if (!dataForm) return;

        loadingActions.enable();
        compositionRoot.dataForms
            .getValues(dataForm.id, {
                orgUnitId,
                periods: DataFormM.getReferencedPeriods(dataForm, period),
            })
            .then(dataValues => {
                setDataValues(dataValues);
            })
            .finally(() => {
                loadingActions.disable();
            });
    }, [dataForm, compositionRoot, orgUnitId, period, reloadKey, loadingActions]);

    const saveDataValue = useCallback<DataFormInfo["data"]["save"]>(
        async (dataValue: DataValue) => {
            if (!dataValues) return dataValues;
            return compositionRoot.dataForms.saveValue(dataValues, dataValue).then(newStore => {
                setDataValues(prev => {
                    if (!prev) return undefined;
                    return {
                        get: newStore.get,
                        set: newStore.set,
                        getOrEmpty: newStore.getOrEmpty,
                        store: {
                            ...prev.store,
                            ...newStore.store,
                        },
                    };
                });
            });
        },
        [compositionRoot, dataValues]
    );

    const SourceTypeApplyToAll = useCallback<DataFormInfo["data"]["stApplyToAll"]>(
        async (dataValue: DataValueTextMultiple, sourceTypeDEs: DataElementRefType[], rows: Row[]) => {
            if (!dataValues) return undefined;
            return compositionRoot.dataForms.applyToAll(dataValues, dataValue, sourceTypeDEs, rows).then(newStore => {
                setDataValues(prev => {
                    if (!prev) return undefined;
                    return {
                        get: newStore.get,
                        set: newStore.set,
                        getOrEmpty: newStore.getOrEmpty,
                        store: {
                            ...prev.store,
                            ...newStore.store,
                        },
                    };
                });
            });
        },
        [compositionRoot, dataValues]
    );

    const saveWithTotals = useCallback<DataFormInfo["data"]["saveWithTotals"]>(
        async (
            dataValue: DataValueNumberSingle,
            total: DataElement,
            columnTotal: DataElement,
            rowDataElements: DataElement[],
            columnDataElements: DataElement[],
            cocId: string
        ) => {
            if (!dataValues) return dataValues;
            return compositionRoot.dataForms
                .saveWithTotals(dataValues, dataValue, total, columnTotal, rowDataElements, columnDataElements, cocId)
                .then(newStore => {
                    setDataValues(prev => {
                        if (!prev) return undefined;
                        return {
                            get: newStore.get,
                            set: newStore.set,
                            getOrEmpty: newStore.getOrEmpty,
                            store: {
                                ...prev.store,
                                ...newStore.store,
                            },
                        };
                    });
                });
        },
        [compositionRoot, dataValues]
    );

    const dataFormInfo: Maybe<DataFormInfo> =
        dataForm && dataValues
            ? {
                  metadata: { dataForm },
                  data: {
                      values: dataValues,
                      save: saveDataValue,
                      stApplyToAll: SourceTypeApplyToAll,
                      saveWithTotals: saveWithTotals,
                  },
                  initForm,
                  orgUnitId,
                  period,
                  categoryOptionComboId: defaultCategoryOptionComboId,
              }
            : undefined;

    return [dataFormInfo, isLoading];
}

export interface DataFormInfo {
    metadata: { dataForm: DataForm };
    data: {
        values: DataValueStore;
        save: (dataValue: DataValue) => Promise<void>;
        stApplyToAll: (
            dataValue: DataValueTextMultiple,
            sourceTypeDEs: DataElementRefType[],
            rows: Row[]
        ) => Promise<void>;
        saveWithTotals: (
            dataValue: DataValueNumberSingle,
            total: DataElement,
            columnTotal: DataElement,
            rowDataElements: DataElement[],
            columnDataElements: DataElement[],
            cocId: string
        ) => Promise<void>;
    };
    initForm: () => void;
    categoryOptionComboId: Id;
    orgUnitId: Id;
    period: Period;
}

const commentDialogCss = `
    [aria-describedby="historyDiv"] {
        top: 65px !important;
    }
`;

const styles = {
    visible: { opacity: "1" },
    invisible: { opacity: "0" },
};

const CommentDialogStyles: React.FC = () => {
    return <style>{commentDialogCss}</style>;
};

export default React.memo(AutogeneratedForm);
