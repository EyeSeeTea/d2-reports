import { useEffect, useState } from "react";
import { useBooleanState } from "../../../../utils/use-boolean";
import { useAppContext } from "../../../../contexts/app-context";
import { AMCRecalculation } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";

export function useATCUpload() {
    const { compositionRoot } = useAppContext();

    const [isPatchModalOpen, { enable: openPatchModal, disable: closePatchModal }] = useBooleanState(false);
    const [isUploadATCModalOpen, { enable: openUploadATCModal, disable: closeUploadATCModal }] = useBooleanState(false);
    const [isRecalculateLogicModalOpen, { enable: openRecalculateLogicModal, disable: closeRecalculateLogicModal }] =
        useBooleanState(false);

    const [recalculationLogic, setRecalculationLogic] = useState<AMCRecalculation>();
    const [loggerProgram, setLoggerProgram] = useState<string>("");

    useEffect(() => {
        compositionRoot.glassAdmin.getATCRecalculationLogic(Namespaces.AMC_RECALCULATION).then(setRecalculationLogic);
    }, [compositionRoot.glassAdmin, recalculationLogic?.loggerProgram]);

    useEffect(() => {
        if (recalculationLogic) {
            compositionRoot.glassAdmin.getATCLoggerProgram(recalculationLogic.loggerProgram).then(setLoggerProgram);
        }
    }, [compositionRoot.glassAdmin, recalculationLogic]);

    return {
        isPatchModalOpen,
        isUploadATCModalOpen,
        isRecalculateLogicModalOpen,
        loggerProgram,
        closePatchModal,
        closeUploadATCModal,
        openPatchModal,
        openUploadATCModal,
        openRecalculateLogicModal,
        closeRecalculateLogicModal,
    };
}
