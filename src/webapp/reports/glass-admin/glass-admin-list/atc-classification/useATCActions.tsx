import { useCallback, useEffect, useState } from "react";
import { ATCItemIdentifier } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { useAppContext } from "../../../../contexts/app-context";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../../locales";

export function useATCActions(
    reload: () => void,
    closePatchModal: () => void,
    closeUploadATCModal: () => void,
    closeRecalculateLogicModal: () => void
) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
    const [isRecalculated, setIsRecalculated] = useState<boolean>(false);
    const [loggerProgram, setLoggerProgram] = useState<string>("");

    useEffect(() => {
        compositionRoot.glassAdmin.getATCLoggerProgram(Namespaces.AMC_RECALCULATION).then(setLoggerProgram);
    }, [compositionRoot.glassAdmin]);

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
        snackbar.success(i18n.t("Recalculation has been cancelled successfully"));
    }, [compositionRoot.glassAdmin, reload, snackbar]);

    const saveRecalculationLogic = useCallback(async () => {
        try {
            setIsRecalculating(true);
            await compositionRoot.glassAdmin.saveRecalculationLogic(Namespaces.AMC_RECALCULATION);
            snackbar.success(
                i18n.t("Please go to the program {{loggerProgram}} to see the logs of this recalculation", {
                    loggerProgram,
                })
            );
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
        isRecalculating,
        isRecalculated,
        cancelRecalculation,
        patchVersion,
        saveRecalculationLogic,
        uploadATCFile,
    };
}
