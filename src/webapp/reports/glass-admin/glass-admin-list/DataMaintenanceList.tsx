import React, { useState } from "react";
import { Filter, Filters } from "./amc-report/Filter";
import { TabPanel } from "../../../components/tabs/TabPanel";
import { TabHeader } from "../../../components/tabs/TabHeader";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import { ATCClassificationList } from "./atc-classification/ATCClassificationList";
import { AMCReport } from "./amc-report/AMCReport";
import { useFiles } from "./amc-report/useFiles";

export const DataMaintenanceList: React.FC = React.memo(() => {
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter());
    const { isDeleteModalOpen } = useFiles(filters);

    const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <React.Fragment>
            <Filters values={filters} onChange={setFilters} />

            <TabHeader labels={reportTabs} tabIndex={tabIndex} onChange={handleChange} />

            <TabPanel value={tabIndex} index={0}>
                <AMCReport filters={filters} />
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
                <ATCClassificationList />
            </TabPanel>

            <LoadingScreen isOpen={isDeleteModalOpen} />
        </React.Fragment>
    );
});

const reportTabs = ["AMC Report", "ATC Classification"];

function getEmptyDataValuesFilter(): Filter {
    return {
        module: undefined,
    };
}
