import React from "react";
import styled from "styled-components";
import { Tabs, Tab, Box } from "@material-ui/core";
import { Section, SectionWithPeriods, ViewType } from "../../../domain/common/entities/DataForm";
import TableForm from "./TableForm";
import GridForm from "./GridForm";
import GridWithPeriods from "./GridWithPeriods";
import GridWithTotals from "./GridWithTotals";
import { assertUnreachable } from "../../../utils/ts-utils";
import { DataFormInfo } from "./AutogeneratedForm";
import GridWithCombos from "./GridWithCombos";
import GridWithSubNational from "./GridWithSubNational";

export interface TabPanelProps {
    sections: Section[];
    dataFormInfo: DataFormInfo;
}

interface TabProps {
    section: Section;
    dataFormInfo: DataFormInfo;
    value: number;
}

interface TypeSwitchProps {
    section: Section;
    dataFormInfo: DataFormInfo;
    viewType: ViewType;
}

function TypeSwitch(props: TypeSwitchProps) {
    const { section, dataFormInfo, viewType } = props;

    switch (viewType) {
        case "table":
            return <TableForm key={`${section.id}+tab`} dataFormInfo={dataFormInfo} section={section} />;
        case "grid":
            return <GridForm key={`${section.id}+tab`} dataFormInfo={dataFormInfo} section={section} />;
        case "grid-with-periods":
            return (
                <GridWithPeriods
                    key={`${section.id}+tab`}
                    dataFormInfo={dataFormInfo}
                    section={section as SectionWithPeriods}
                />
            );
        case "grid-with-totals":
            return <GridWithTotals key={`${section.id}+tab`} dataFormInfo={dataFormInfo} section={section} />;
        case "grid-with-combos":
            return <GridWithCombos key={`${section.id}+tab`} dataFormInfo={dataFormInfo} section={section} />;
        case "grid-with-subnational-ous":
            return <GridWithSubNational key={`${section.id}+tab`} dataFormInfo={dataFormInfo} section={section} />;
        default:
            assertUnreachable(viewType);
    }
}

function isTabHeader(order: number | undefined) {
    if (order === undefined) return false;
    if (order % 1 === 0) return true;

    if (order === Math.floor(order) + 0.1) {
        return true;
    }
}

const AutoFormComponent = React.memo(TypeSwitch);

const TabPanel: React.FC<TabProps> = React.memo(props => {
    const { section, dataFormInfo, value } = props;
    const { viewType, tabs } = section;
    const index = tabs.order !== undefined ? Math.floor(tabs.order) : -1;

    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
            <AutoFormComponent dataFormInfo={dataFormInfo} section={section} viewType={viewType} />
        </div>
    );
});

const TabsWithScroll = styled(Tabs)`
    .MuiTabs-fixed {
        overflow: auto !important;
    }
`;

const SectionsTabs: React.FC<TabPanelProps> = React.memo(props => {
    const { sections, dataFormInfo } = props;
    const [activeTab, setActiveTab] = React.useState(0);
    const handleChange = (event: React.ChangeEvent<{}>, value: number) => {
        setActiveTab(value);
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabsWithScroll value={activeTab} onChange={handleChange}>
                    {sections.flatMap(section => {
                        const order = section.tabs.order;
                        if (isTabHeader(order)) {
                            return (
                                <Tab
                                    key={section.id + "Tab"}
                                    label={section.name}
                                    id={`tab-${order}`}
                                    aria-controls={`tabpanel-${order}`}
                                />
                            );
                        } else {
                            return [];
                        }
                    })}
                </TabsWithScroll>
            </Box>
            {sections.map(section => {
                return (
                    <TabPanel
                        key={section.id + "TabPanel"}
                        value={activeTab}
                        dataFormInfo={dataFormInfo}
                        section={section}
                    />
                );
            })}
        </Box>
    );
});

export default React.memo(SectionsTabs);