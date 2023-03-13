import React from "react";
// @ts-ignore
import { FileInput, Button } from "@dhis2/ui";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueFile } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";
import { sizeFormatter } from "human-readable";

export interface FileWidgetProps extends WidgetProps {
    dataValue: DataValueFile;
}

const FileWidget: React.FC<FileWidgetProps> = props => {
    const { onValueChange, dataValue, disabled } = props;

    const notifyChange = React.useCallback(
        (value: { name: string; files: [File] }) => {
            const file = value.files[0];
            onValueChange({ ...dataValue, fileToSave: file });
        },
        [onValueChange, dataValue]
    );

    const deleteFile = React.useCallback(() => {
        onValueChange({ ...dataValue, fileToSave: undefined });
    }, [onValueChange, dataValue]);

    const { file } = dataValue;

    return (
        <WidgetFeedback state={props.state}>
            <FileInput
                disabled={disabled}
                buttonLabel="Upload file"
                name="upload"
                onChange={notifyChange} //
            />

            {file && (
                <span>
                    <a download target="_blank" rel="noreferrer" href={file.url}>
                        {file.name}
                    </a>
                    &nbsp; ({format(file.size)}) &nbsp;
                    <Button onClick={deleteFile}>✕</Button>
                </span>
            )}
        </WidgetFeedback>
    );
};

const format = sizeFormatter({ decimalPlaces: 2, keepTrailingZeroes: false });

export default React.memo(FileWidget);
