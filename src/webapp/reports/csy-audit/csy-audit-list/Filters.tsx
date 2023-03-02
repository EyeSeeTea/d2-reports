import React, { useMemo } from "react";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { useAppContext } from "../../../contexts/app-context";
import { Id } from "../../../../domain/common/entities/Base";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import styled from "styled-components";
import { Dropdown, DropdownProps, MultipleDropdown, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";

export interface FiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    auditType: string;
    orgUnitPaths: Id[];
    periodType: string;
    periods: string[];
}

interface FilterOptions {
    periods: string[];
}

export const Filters: React.FC<FiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const auditTypeItems = React.useMemo(() => {
        return [{ value: "mortality", text: i18n.t("Mortality") }];
    }, []);

    const periodTypeItems = React.useMemo(() => {
        return [
            { value: "yearly", text: i18n.t("Yearly") },
            { value: "quarterly", text: i18n.t("Quarterly") },
        ];
    }, []);

    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    const setAuditType = React.useCallback<SingleDropdownHandler>(
        auditType => {
            onChange(filter => ({ ...filter, auditType: auditType ?? "" }));
        },
        [onChange]
    );

    const setPeriodType = React.useCallback<SingleDropdownHandler>(
        periodType => {
            onChange(filter => ({ ...filter, periodType: periodType ?? "" }));
        },
        [onChange]
    );

    const setPeriods = React.useCallback<DropdownHandler>(
        periods => onChange(prev => ({ ...prev, periods })),
        [onChange]
    );

    return (
        <Container>
            <SingleDropdownStyled
                items={auditTypeItems}
                value={filter.auditType}
                onChange={setAuditType}
                label={i18n.t("Audit Type")}
                hideEmpty
            />

            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={paths => onChange({ ...filter, orgUnitPaths: paths })}
            />

            <SingleDropdownStyled
                items={periodTypeItems}
                value={filter.periodType}
                onChange={setPeriodType}
                label={i18n.t("Period Type")}
                hideEmpty
            />

            <DropdownStyled
                items={periodItems}
                values={filter.periods}
                onChange={setPeriods}
                label={i18n.t("Periods")}
            />
        </Container>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 180px;
`;

const DropdownStyled = styled(MultipleDropdown)`
    margin-left: -10px;
`;

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
