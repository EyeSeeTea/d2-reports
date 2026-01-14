import { useCallback } from "react";
import { CompositionRoot } from "../../../../../compositionRoot";
import { useBooleanState } from "../../../../utils/use-boolean";

interface DeleteFilesState {
    isDeleteModalOpen: boolean;
    deleteFiles(ids: string[]): void;
}

export function useDeleteFiles(compositionRoot: CompositionRoot, reload: () => void): DeleteFilesState {
    const [isDeleteModalOpen, { enable: openDeleteModal, disable: closeDeleteModal }] = useBooleanState(false);

    const deleteFiles = useCallback(
        async (ids: string[]) => {
            openDeleteModal();
            await compositionRoot.glassAdmin.updateStatus("delete", ids)?.then(() => closeDeleteModal());
            reload();
        },
        [closeDeleteModal, compositionRoot.glassAdmin, openDeleteModal, reload]
    );

    return { deleteFiles, isDeleteModalOpen };
}
