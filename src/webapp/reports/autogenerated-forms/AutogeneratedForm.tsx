import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../contexts/app-context";

import { DataForm } from "../../../domain/common/entities/DataForm";
import { DataValue, DataValueStore, Period } from "../../../domain/common/entities/DataValue";
import { useDataEntrySelector } from "./useDataEntrySelector";
import i18n from "@eyeseetea/d2-ui-components/locales";
import GridForm from "./GridForm";
import { assertUnreachable, Maybe } from "../../../utils/ts-utils";
import { Id } from "../../../domain/common/entities/Base";
import TableForm from "./TableForm";
import { useBooleanState } from "../../utils/use-boolean";
import { LinearProgress } from "@material-ui/core";

const AutogeneratedForm: React.FC = () => {
    const [dataFormInfo, isLoading] = useDataFormInfo();
    if (!dataFormInfo) return <div>{i18n.t("Loading...")}</div>;
    const { dataForm } = dataFormInfo.metadata;

    if (dataForm.sections.length === 0)
        return <p>{i18n.t("There are no sections in this data set. Check README for more details")}</p>;

    return (
        <div ref={dataFormInfo.initForm}>
            {<LinearProgress style={isLoading ? styles.visible : styles.invisible} />}

            <CommentDialogStyles />

            <Html content={dataForm.texts.header} />

            <div key={dataFormInfo.period}>
                {dataForm.sections.map(section => {
                    switch (section.viewType) {
                        case "grid":
                            return <GridForm key={section.id} dataFormInfo={dataFormInfo} section={section} />;
                        case "table":
                            return <TableForm key={section.id} dataFormInfo={dataFormInfo} section={section} />;
                        default:
                            assertUnreachable(section.viewType);
                    }
                })}
            </div>

            <Html content={dataForm.texts.footer} />
        </div>
    );
};

function useDataFormInfo(): [Maybe<DataFormInfo>, boolean] {
    const { compositionRoot } = useAppContext();
    const { orgUnitId, period, dataSetId, reloadKey, initForm } = useDataEntrySelector();
    const [dataForm, setDataForm] = useState<DataForm>();
    const [dataValues, setDataValues] = useState<DataValueStore>();
    const [isLoading, loadingActions] = useBooleanState(false);

    const { config } = useAppContext();

    const defaultCategoryOptionComboId = config.categoryOptionCombos.default.id;

    useEffect(() => {
        compositionRoot.dataForms.get(dataSetId).then(setDataForm);
    }, [compositionRoot, dataSetId]);

    useEffect(() => {
        loadingActions.enable();
        compositionRoot.dataForms
            .getValues(dataSetId, { orgUnitId, period })
            .then(dataValues => {
                setDataValues(dataValues);
            })
            .finally(() => {
                loadingActions.disable();
            });
    }, [compositionRoot, orgUnitId, dataSetId, period, reloadKey, loadingActions]);

    // Save the data value but don't update dataValues (it re-renders all the form)
    const saveDataValue = useCallback(
        (dataValue: DataValue) => compositionRoot.dataForms.saveValue(dataValue),
        [compositionRoot]
    );

    const dataFormInfo =
        dataForm && dataValues
            ? {
                  metadata: { dataForm },
                  data: { values: dataValues, save: saveDataValue },
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

const Html: React.FC<{ content: string | undefined }> = props => {
    return props.content ? <div dangerouslySetInnerHTML={{ __html: props.content }} /> : null;
};

export default React.memo(AutogeneratedForm);
