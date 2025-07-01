import { useMemo } from "react";
import { useAppContext } from "../../../../contexts/app-context";

type DataApprovalUserPermissionsState = {
    isMalAdmin: boolean;
    isMalCountryApprover: boolean;
};

export function useDataApprovalPermissions(): DataApprovalUserPermissionsState {
    const {
        config: { currentUser },
    } = useAppContext();

    const isMalCountryApprover = useMemo(
        () => currentUser.userGroups.map(userGroup => userGroup.name).includes("MAL_Country Approver"),
        [currentUser.userGroups]
    );
    const isMalAdmin = useMemo(
        () => currentUser.userGroups.map(userGroup => userGroup.name).includes("MAL_Malaria admin"),
        [currentUser.userGroups]
    );

    return {
        isMalAdmin: isMalAdmin,
        isMalCountryApprover: isMalCountryApprover,
    };
}
