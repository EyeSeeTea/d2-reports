import React, { useMemo, useState } from "react";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { useAppContext } from "../../../contexts/app-context";
import { Id } from "../../../../domain/common/entities/Base";
import styled from "styled-components";
import { Dropdown, DropdownProps } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import _ from "lodash";
import { AuditType } from "../../../../domain/reports/csy-audit-operative/entities/AuditItem";

export interface FiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    auditType: AuditType;
    orgUnitPaths: Id[];
    periodType: string;
    year: string;
    quarter?: string;
}

export type FilterOptions = {
    periods: string[];
};

export const Filters: React.FC<FiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const [periodType, setPerType] = useState<string>("yearly");
    const rootIds = React.useMemo(
        () =>
            _(config.currentUser.orgUnits)
                .map(ou => ou.id)
                .value(),
        [config]
    );

    const yearItems = useMemoOptionsFromStrings(filterOptions.periods);

    const setAuditType = React.useCallback<SingleDropdownHandler>(
        auditType => {
            onChange(filter => ({ ...filter, auditType: auditType as AuditType }));
        },
        [onChange]
    );

    const setQuarterPeriod = React.useCallback<SingleDropdownHandler>(
        quarterPeriod => {
            onChange(filter => ({ ...filter, quarter: quarterPeriod ?? "" }));
        },
        [onChange]
    );

    const setPeriodType = React.useCallback<SingleDropdownHandler>(
        periodType => {
            setPerType(periodType ?? "yearly");
            setQuarterPeriod(periodType !== "yearly" ? "Q1" : undefined);

            onChange(filter => ({ ...filter, periodType: periodType ?? "yearly" }));
        },
        [onChange, setQuarterPeriod]
    );

    const setYear = React.useCallback<SingleDropdownHandler>(
        year => {
            onChange(filter => ({ ...filter, year: year ?? "" }));
        },
        [onChange]
    );

    return (
        <Container>
            <AuditTypeDropdown
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
                selectableLevels={[1, 2, 3, 4, 5, 6, 7]}
            />

            <SingleDropdownStyled
                items={periodTypeItems}
                value={filter.periodType}
                onChange={setPeriodType}
                label={i18n.t("Period Type")}
                hideEmpty
            />

            <SingleDropdownStyled
                items={yearItems}
                value={filter.year}
                onChange={setYear}
                label={i18n.t("Year")}
                hideEmpty
            />

            {periodType === "quarterly" && (
                <>
                    <SingleDropdownStyled
                        items={quarterPeriodItems}
                        value={filter.quarter}
                        onChange={setQuarterPeriod}
                        label={i18n.t("Quarter")}
                        hideEmpty
                    />
                </>
            )}
        </Container>
    );
});

const quarterPeriodItems = [
    { value: "Q1", text: i18n.t("Jan - March") },
    { value: "Q2", text: i18n.t("April - June") },
    { value: "Q3", text: i18n.t("July - September") },
    { value: "Q4", text: i18n.t("October - December") },
];

const periodTypeItems = [
    { value: "yearly", text: i18n.t("Yearly") },
    { value: "quarterly", text: i18n.t("Quarterly") },
];

export const auditTypeItems = [
    {
        value: "lowRiskMortality",
        text: i18n.t("Mortality (operative and 24hr) among low-risk patients (ASA score 1-2) "),
        auditDefinition: i18n.t(
            "(CSY_OP_Disposition on Leaving Operating Theatre == Deceased || CSY_OP_Disposition 24 Hours After Surgery == Deceased) && CSY_OP_ASA Functional Status Score == ASA 1 or ASA 2"
        ),
    },
    {
        value: "zeroComorbidityMortality",
        text: i18n.t("Mortality (operative and 24hr) in patients with 0 comorbidities "),
        auditDefinition: i18n.t(
            "(CSY_OP_Disposition on Leaving Operating Theatre == Deceased || CSY_OP_Disposition 24 Hours After Surgery == Deceased) && Number of Major Medical Comorbidities == 0"
        ),
    },
    {
        value: "cSectionMortality",
        text: i18n.t("Mortality (operative and 24hr) in patients who undergo C-section ​"),
        auditDefinition: i18n.t(
            "(CSY_OP_Disposition on Leaving Operating Theatre == Deceased || CSY_OP_Disposition 24 Hours After Surgery == Deceased) && (CSY_OP_SurgicalIntervention == Caesarean Section || CSY_OP_SurgicalIntervention 2 == Caesarean Section || CSY_OP_SurgicalIntervention 3 == Caesarean Section || CSY_OP_SurgicalIntervention 4 == Caesarean Section || CSY_OP_SurgicalIntervention 5 == Caesarean Section )"
        ),
    },
    {
        value: "emergentCase",
        text: i18n.t("Number of prior facilities is >1 and case urgency is Emergent"),
        auditDefinition: i18n.t(
            "ETA_Facility Transfers > 1 && CSY_OP_Urgency of Surgery == Acute emergency, needed within 6 hours (Emergent)"
        ),
    },
    {
        value: "surgeryChecklist",
        text: i18n.t("All cases where the Safe Surgery checklist was not performed"),
        auditDefinition: i18n.t("CSY_OP_Safe Surgery Check List Used == No"),
    },
    {
        value: "otMortality",
        text: i18n.t("All cases of OR/OT mortality"),
        auditDefinition: i18n.t("CSY_OP_Disposition on Leaving Operating Theatre == Deceased"),
    },
    {
        value: "acuteEmergentCase",
        text: i18n.t("Emergent case and time to OR/OT > 6 hours (admission time-operative time)"),
        auditDefinition: i18n.t(
            "CSY_OP_Urgency of Surgery == Acute emergency, needed within 6 hours (Emergent) && (Arrival Date and Time - Date and Time of Operating Theatre Arrival > 6 hours)"
        ),
    },
    {
        value: "nonSpecialistMortality",
        text: i18n.t(
            "All cases of mortality where the category of surgical or anesthesia provider is not a specialist"
        ),
        auditDefinition: i18n.t(
            "(CSY_OP_Disposition on Leaving Operating Theatre  == Deceased || CSY_OP_Disposition 24 Hours After Surgery == Deceased) && ((CSY_OP_Category of Surgical Provider ≠ Surgeon with Specialty in Surgery Performed or Primary Anaesthesia type ≠ Specialist Anaesthesia Physician) || (CSY_OP_Category of Surgical Provider 2 ≠ Surgeon with Specialty in Surgery Performed or Primary Anaesthesia type ≠ Specialist Anaesthesia Physician) || (CSY_OP_Category of Surgical Provider 3 ≠ Surgeon with Specialty in Surgery Performed or Primary Anaesthesia type ≠ Specialist Anaesthesia Physician))"
        ),
    },
    {
        value: "pulseOximetry",
        text: i18n.t("All cases without pulse oximetry used"),
        auditDefinition: i18n.t(
            "CSY_OP_Monitoring Used Intra-operatively ≠ Pulse oximeter && CSY_OP_Monitoring Used Intra-operatively 2 ≠ Pulse oximeter && CSY_OP_Monitoring Used Intra-operatively 3 ≠ Pulse oximeter && CSY_OP_Monitoring Used Intra-operatively 4 ≠ Pulse oximeter && CSY_OP_Monitoring Used Intra-operatively 5 ≠ Pulse oximeter "
        ),
    },
    {
        value: "intraOperativeComplications",
        text: i18n.t("Any intra-operative complications in patients with ASA 1-2 or 0 co-morbidities"),
        auditDefinition: i18n.t(
            "If CSY_OP_Intra-operative complication has value && (CSY_OP_ASA Functional Status Score == ASA 1 or ASA 2 || ETA_Major Medical Comorbidities == 0)"
        ),
    },
];

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

const AuditTypeDropdown = styled(Dropdown)`
    margin-left: -10px;
    width: 600px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 180px;
`;

type SingleDropdownHandler = DropdownProps["onChange"];
