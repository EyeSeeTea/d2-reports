type AtcDddIndexData = {
    atcs: unknown[];
    ddds: unknown[];
    combinations: unknown[];
    changes: unknown[];
    conversions_iu_g: unknown[];
    conversions_ddd_g: unknown[];
    salts: unknown[];
    roas: unknown[];
    units: unknown[];
};

const ATC_DDD_INDEX: (keyof AtcDddIndexData)[] = [
    "atcs",
    "ddds",
    "combinations",
    "changes",
    "conversions_iu_g",
    "conversions_ddd_g",
    "salts",
    "roas",
    "units",
];

type AmClassificationData = {
    classification: unknown[];
    atc_am_mapping: unknown[];
};

const AM_KEYS: (keyof AmClassificationData)[] = ["classification", "atc_am_mapping"];

type AwareClassificationData = {
    classification: unknown[];
    atc_awr_mapping: unknown[];
};

const AWARE_KEYS: (keyof AwareClassificationData)[] = ["classification", "atc_awr_mapping"];

export type GlassAtcData = {
    atcs: unknown[];
    ddds: unknown[];
    combinations: unknown[];
    changes: unknown[];
    conversions_iu_g: unknown[];
    conversions_ddd_g: unknown[];
    salts: unknown[];
    roas: unknown[];
    units: unknown[];
    am_classification: AmClassificationData;
    aware_classification: AwareClassificationData;
};

function isDataValid(data: Record<string, unknown[]>[]): boolean {
    const maybeAtcDddIndexData = data.find(dataItem => ATC_DDD_INDEX.every(key => Object.keys(dataItem).includes(key)));
    const maybeAmClassificationData = data.find(dataItem => AM_KEYS.every(key => Object.keys(dataItem).includes(key)));
    const maybeAwareClassificationData = data.find(dataItem =>
        AWARE_KEYS.every(key => Object.keys(dataItem).includes(key))
    );

    return data.length === 3 && !!maybeAtcDddIndexData && !!maybeAmClassificationData && !!maybeAwareClassificationData;
}

function getAtcDddIndexData(data: Record<string, unknown[]>[]): AtcDddIndexData {
    const maybeAtcDddIndexData = data.find(dataItem => ATC_DDD_INDEX.every(key => Object.keys(dataItem).includes(key)));
    if (maybeAtcDddIndexData) {
        const atcDddIndexData = Object.keys(maybeAtcDddIndexData).reduce((acc, key) => {
            if (ATC_DDD_INDEX.includes(key as keyof AtcDddIndexData)) {
                acc[key as keyof AtcDddIndexData] = (maybeAtcDddIndexData as AtcDddIndexData)[
                    key as keyof AtcDddIndexData
                ];
            }
            return acc;
        }, {} as AtcDddIndexData);
        return atcDddIndexData;
    }
    throw Error(
        "ATC and DDD index data is not valid. Should contain atcs, ddds ,combinations, changes, conversions_iu_g, conversions_ddd_g, salts, roas, units"
    );
}

function getAwareClassificationData(data: Record<string, unknown[]>[]): AwareClassificationData {
    const maybeAwareClassificationData = data.find(dataItem =>
        AWARE_KEYS.every(key => Object.keys(dataItem).includes(key))
    );
    if (maybeAwareClassificationData) {
        const awareClassificationData = Object.keys(maybeAwareClassificationData).reduce((acc, key) => {
            if (AWARE_KEYS.includes(key as keyof AwareClassificationData)) {
                acc[key as keyof AwareClassificationData] = (maybeAwareClassificationData as AwareClassificationData)[
                    key as keyof AwareClassificationData
                ];
            }
            return acc;
        }, {} as AwareClassificationData);
        return awareClassificationData;
    }
    throw Error("Aware Classification data is not valid. Should contain classification and atc_awr_mapping");
}

function getAmClassificationData(data: Record<string, unknown[]>[]): AmClassificationData {
    const maybeAmClassificationData = data.find(dataItem => AM_KEYS.every(key => Object.keys(dataItem).includes(key)));
    if (maybeAmClassificationData) {
        const amClassificationData = Object.keys(maybeAmClassificationData).reduce((acc, key) => {
            if (AM_KEYS.includes(key as keyof AmClassificationData)) {
                acc[key as keyof AmClassificationData] = (maybeAmClassificationData as AmClassificationData)[
                    key as keyof AmClassificationData
                ];
            }
            return acc;
        }, {} as AmClassificationData);
        return amClassificationData;
    }
    throw Error("Am Classification data is not valid. Should contain classification and atc_am_mapping");
}

export function getGlassAtcData(data: Record<string, unknown[]>[]): GlassAtcData {
    if (isDataValid(data)) {
        return {
            ...getAtcDddIndexData(data),
            am_classification: getAmClassificationData(data),
            aware_classification: getAwareClassificationData(data),
        };
    }
    throw Error(
        "ATC data is not valid. File should contain atc_ddd_index.json, aware_classification.json, and am_classification.json"
    );
}
