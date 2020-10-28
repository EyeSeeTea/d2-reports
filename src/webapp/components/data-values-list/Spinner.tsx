import React from "react";
import { CircularProgress } from "@material-ui/core";

interface SpinnerProps {
    isVisible: boolean;
}

const Spinner_: React.FunctionComponent<SpinnerProps> = ({ isVisible }) => (
    <React.Fragment>
        <div style={{ flex: "10 1 auto" }}></div>
        {isVisible && <CircularProgress />}
    </React.Fragment>
);

export const Spinner = React.memo(Spinner_);
