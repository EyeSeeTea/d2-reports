import React from "react";
import styled from "styled-components";
import { MultipleDropdown } from "@eyeseetea/d2-ui-components";
import { OrgUnit } from "../../../domain/common/entities/OrgUnit";
import { defaultPeriods } from "./nhwa-settings";
import { OrgUnitsFilterButton } from "../../components/org-units-filter/OrgUnitsFilterButton";
import { D2Api } from "./../../../types/d2-api";
import i18n from "../../../locales";

type FiltersProps = {
    api: D2Api;
    rootIds: string[];
    orgUnits: OrgUnit[];
    selectedOrgUnits: string[];
    selectedPeriod: string[];
    setSelectedOrgUnits: (paths: string[]) => void;
    setSelectedPeriods: (periods: string[]) => void;
};

export const Filters: React.FC<FiltersProps> = React.memo(props => {
    const {
        api,
        rootIds,
        selectedOrgUnits,
        selectedPeriod,
        setSelectedOrgUnits,
        setSelectedPeriods: onChangePeriod,
    } = props;

    return (
        <ContainerFilter>
            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={selectedOrgUnits}
                setSelected={setSelectedOrgUnits}
                selectableLevels={[1, 2, 3]}
            />

            <MultipleDropdown
                items={defaultPeriods}
                onChange={onChangePeriod}
                label={i18n.t("Period")}
                values={selectedPeriod}
            />
        </ContainerFilter>
    );
});

const ContainerFilter = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;
