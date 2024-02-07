import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useCallback, useEffect, useState } from "react";
import { useBooleanState } from "../../../../utils/use-boolean";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../../contexts/app-context";
import {
    AMCRecalculation,
    ATCItemIdentifier,
} from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";

export function useATCUpload(reload: () => void) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [isPatchModalOpen, { enable: openPatchModal, disable: closePatchModal }] = useBooleanState(false);
    const [isUploadATCModalOpen, { enable: openUploadATCModal, disable: closeUploadATCModal }] = useBooleanState(false);
    const [isRecalculateLogicModalOpen, { enable: openRecalculateLogicModal, disable: closeRecalculateLogicModal }] =
        useBooleanState(false);

    const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
    const [recalculationLogic, setRecalculationLogic] = useState<AMCRecalculation>();
    const [loggerProgram, setLoggerProgram] = useState<string>("");
    const [isRecalculated, setIsRecalculated] = useState<boolean>(false);

    useEffect(() => {
        compositionRoot.glassAdmin.getATCRecalculationLogic(Namespaces.AMC_RECALCULATION).then(setRecalculationLogic);
    }, [compositionRoot.glassAdmin, recalculationLogic?.loggerProgram]);

    useEffect(() => {
        if (recalculationLogic) {
            compositionRoot.glassAdmin.getATCLoggerProgram(recalculationLogic.loggerProgram).then(setLoggerProgram);
        }
    }, [compositionRoot.glassAdmin, recalculationLogic]);

    const patchVersion = useCallback(
        async (selectedFile: File | undefined, period: string, selectedItems: ATCItemIdentifier[]) => {
            try {
                if (selectedFile) {
                    await compositionRoot.glassAdmin.uploadFile(Namespaces.ATCS, selectedFile, period, selectedItems);
                    snackbar.success(i18n.t("Version has been successfully patched"));
                }
            } catch (error) {
                snackbar.error(i18n.t("Error encountered when parsing version"));
            } finally {
                closePatchModal();
                reload();
            }
        },
        [closePatchModal, compositionRoot.glassAdmin, reload, snackbar]
    );

    const uploadATCFile = useCallback(
        async (selectedFile: File | undefined, period: string) => {
            try {
                if (selectedFile) {
                    await compositionRoot.glassAdmin.uploadFile(Namespaces.ATCS, selectedFile, period);
                    snackbar.success(i18n.t("Upload finished"));
                }
            } catch (error) {
                snackbar.error(i18n.t("Error parsing the file"));
            } finally {
                closeUploadATCModal();
                reload();
            }
        },
        [closeUploadATCModal, compositionRoot.glassAdmin, reload, snackbar]
    );

    const cancelRecalculation = useCallback(async () => {
        await compositionRoot.glassAdmin
            .cancelRecalculation(Namespaces.AMC_RECALCULATION)
            .then(() => setIsRecalculated(false));
        reload();
    }, [compositionRoot.glassAdmin, reload]);

    const saveRecalculationLogic = useCallback(async () => {
        try {
            setIsRecalculating(true);
            await compositionRoot.glassAdmin.saveRecalculationLogic(Namespaces.AMC_RECALCULATION, Namespaces.ATCS);
            snackbar.success(`Please go to the program ${loggerProgram} to see the logs of this recalculation`);
        } catch (error) {
            snackbar.error(i18n.t("Error when saving recalculation logic"));
        } finally {
            setIsRecalculating(false);
            setIsRecalculated(true);
            closeRecalculateLogicModal();
            reload();
        }
    }, [closeRecalculateLogicModal, compositionRoot.glassAdmin, loggerProgram, reload, snackbar]);

    return {
        isPatchModalOpen,
        isUploadATCModalOpen,
        isRecalculateLogicModalOpen,
        isRecalculating,
        isRecalculated,
        cancelRecalculation,
        closePatchModal,
        closeUploadATCModal,
        openPatchModal,
        openUploadATCModal,
        openRecalculateLogicModal,
        closeRecalculateLogicModal,
        patchVersion,
        uploadATCFile,
        saveRecalculationLogic,
    };
}
