import _ from "lodash";
import { Section, Texts } from "../../../domain/common/entities/DataForm";
import { DataElement } from "../../../domain/common/entities/DataElement";

/*
TODO: Hard-coded due to time constrains.
This stems from the fact that sections cant have DE from other sections,
but each "grid-with-totals" grid uses the same "Total" DE.
These DEs should be either:
 - Listed in the dataStore and added to the section DEs. (A list for each "grid-with-totals"? A general one?)
 - Use a special formName identifier to avoid polluting the dataStore (worthwhile?)
 - Other solution
Either way, this needs to be agreed with the project manager first.
*/
const totalList = [
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "h6VJJu0W8U7",
        code: "8888-Total",
        name: "1 - Medical Doctors",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "Yxkvq7nmosQ",
        code: "2211-Total",
        name: "1.1 - General Medical Practitioners (incl. Family medical practitioners)",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "Ta8ifRxwOmP",
        code: "2212-Total",
        name: "1.2 - Specialist Medical Practitioners",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "mzBQp5cOihy",
        code: "2212pd-Total",
        name: "1.2.1 - General Paediatricians Practitioners",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "cyNh11xykuJ",
        code: "2212obs-Total",
        name: "1.2.2 - Obstetricians and Gynaecologists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "QxPGLy2DUhG",
        code: "2212psy-Total",
        name: "1.2.3 - Psychiatrists Practitioners",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "nNmvfTuUhng",
        code: "2212med-Total",
        name: "1.2.4 - Medical group of Specialists Practitioners",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "VDeI2btrNih",
        code: "2212surg-Total",
        name: "1.2.5 - Surgical group of Specialists Practitioners",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "pWXXIlhZ8PI",
        code: "2212oth-Total",
        name: "1.2.6 - Other Specialists Practitioners",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "jj5ZtVGdcwd",
        code: "221o-Total",
        name: "1.3 - Medical doctors not further defined",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "sYJkQfzW1BG",
        code: "7777-Total",
        name: "2 - Nursing Personnel",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "LrG8CqG0mhV",
        code: "2221-Total",
        name: "2.1 - Nursing Professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "qKf4eMvqKqq",
        code: "2221-Total_2",
        name: "2.1.1 - Nursing Professionals (with additional midwifery training)",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "eEQkLvHHoSU",
        code: "3221-Total",
        name: "2.2 - Nursing Associate Professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "KwIlxiiBBjV",
        code: "3221-Total_2",
        name: "2.2.1 - Nursing Associate Professionals (with additional midwifery training)",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "CpUti69L5aW",
        code: "222n-Total",
        name: "2.3 - Nurses not further defined",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "t5jOlOCqSr3",
        code: "6666-Total",
        name: "3 - Midwifery personnel",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "nBLlavpOdkF",
        code: "2222-Total",
        name: "3.1 - Midwifery Professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "uHCDEltKEA6",
        code: "3222-Total",
        name: "3.2 - Midwifery Associate Professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "LPTrylkVM4Q",
        code: "222m-Total",
        name: "3.3 - Midwives not further defined",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "tqciYTsRsV1",
        code: "2261-Total",
        name: "4 - Dentists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "VIMlhSMF1Yl",
        code: "3251-Total",
        name: "5 - Dental Assistants and Therapists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "w9b8i3HljgB",
        code: "3214d-Total",
        name: "6 - Dental Prosthetic Technicians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "iDHwJraJp3Y",
        code: "2262-Total",
        name: "7 - Pharmacists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "SOU2X25z1dq",
        code: "3213-Total",
        name: "8 - Pharmaceutical Technicians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "Yz371d8I7vi",
        code: "2240-Total",
        name: "9 - Paramedical Practitioners",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "Fm2HakleZ27",
        code: "3212sct-Total",
        name: "10 - Medical and Pathology Laboratory scientists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "NC58vY6UBEk",
        code: "3211-Total",
        name: "11 - Medical Imaging and Therapeutic Equipment Technicians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "RNCFRfcGsEq",
        code: "3212-Total",
        name: "12 - Medical and Pathology Laboratory Technicians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "W1OgOlx2UPS",
        code: "2263-Total",
        name: "13 - Environmental and Occupational Health Professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "nkvvH6QuQ8t",
        code: "3257-Total",
        name: "14 - Environmental and Occupational Health Inspectors/associates",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "g9WyLxpr1E2",
        code: "2230-Total",
        name: "15 - Traditional and Complementary Medicine Professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "dTCOMljlITC",
        code: "3230-Total",
        name: "16 - Traditional and Complementary Medicine Associate Professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "maFtwxdHWuZ",
        code: "3253-Total",
        name: "17 - Community Health Workers",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "TxYXq9qqMJt",
        code: "532-Total",
        name: "18 - Personal care workers in health service",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "UN1GGvFlETF",
        code: "5321-Total",
        name: "18.1 - Health Care Assistants",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "m5NFJ1IxYaq",
        code: "5322-Total",
        name: "18.2 - Home-based Personal Care",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "It06Qq2EzsF",
        code: "5329-Total",
        name: "18.3 - Personal care workers in health service n.e.c",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "cg1DEEIeZ9N",
        code: "2264-Total",
        name: "19 - Physiotherapists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "zs2x5LAeI3t",
        code: "3255-Total",
        name: "20 - Physiotherapy Technicians and Assistants",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "fqPqYs1WW22",
        code: "2265d-Total",
        name: "21 - Dieticians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "GKnY5V4PkhM",
        code: "2265n-Total",
        name: "22 - Nutritionists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "sbIyFRN4j0N",
        code: "2266-Total",
        name: "23 - Audiologists and Speech Therapists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "vDp3u0DJlrK",
        code: "2267-Total",
        name: "24 - Optometrists and Ophthalmic Opticians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "Tu64Vt7gv8M",
        code: "3254-Total",
        name: "25 - Dispensing Opticians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "yKNKfokBA9x",
        code: "3214m-Total",
        name: "26 - Medical Prosthetic Technicians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "dYKAIYSnLue",
        code: "3252-Total",
        name: "27 - Medical Records Technicians",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "dvNINMJZS3V",
        code: "3256-Total",
        name: "28 - Medical Assistants",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "qr8RGsOOdXn",
        code: "3258-Total",
        name: "29 - Ambulance Workers",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "uzy03WEvMkk",
        code: "2635-Total",
        name: "30 - Social work and counselling professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "qg3FIv25BEt",
        code: "3412-Total",
        name: "31 - Social work associate professionals",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "ec8BXAwrBTh",
        code: "2149-Total",
        name: "32 - Biomedical engineer",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "jY9ia5NLA77",
        code: "2634-Total",
        name: "33 - Psychologists",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "I5C27Tsoc8I",
        code: "3344-Total",
        name: "34 - Medical secretaries",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "oFXCMBtu71f",
        code: "9999mng-Total",
        name: "35 - Managerial staff",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "lT2PXXEtNc0",
        code: "9999adm-Total",
        name: "36 - Administrative staff",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "u4evyxHktVP",
        code: "9999his-Total",
        name: "37 - Health information systems personnel",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "DCAJyToy1TA",
        code: "9999eng-Total",
        name: "38 - Engineering and maintenance staff",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "bUGq4WaBHUD",
        code: "9999pro-Total",
        name: "39 - Other non-medical professional staff",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "v8Xnaigda7O",
        code: "9999sup-Total",
        name: "40 - Other non-medical support staff",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "qXjDZw4zlpE",
        code: "9999sup-Total",
        name: "41 - Epidemiologist (incl. FETP course graduates)",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "orsq4lQakbk",
        code: "9999sup-Total",
        name: "42 - Anesthesiologist",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
    {
        type: "NUMBER",
        numberType: "INTEGER_ZERO_OR_POSITIVE",
        id: "WwrNxNlvDEg",
        name: "43 - Field Epidemiologist",
        categoryCombos: {
            id: "JzvGfLYkX17",
            name: "default",
            categoryOptionCombos: [
                {
                    id: "Xr12mI7VPn3",
                    name: "default",
                },
            ],
        },
    },
];

export interface Grid {
    id: string;
    name: string;
    columns: Column[];
    rows: Row[];
    toggle: Section["toggle"];
    useIndexes: boolean;
    texts: Texts;
}

interface SubSectionGrid {
    name: string;
    dataElements: DataElement[];
}

interface Column {
    name: string;
    deName?: string;
    cocName?: string;
}

interface Row {
    name: string;
    total?: DataElement;
    rowDataElements?: DataElement[];
    rowDisabled?: boolean;
    items: Array<{
        column: Column;
        columnTotal?: DataElement;
        columnDataElements?: DataElement[];
        dataElement: DataElement | undefined;
    }>;
}

const separator = " - ";

export class GridWithTotalsViewModel {
    static get(section: Section): Grid {
        const dataElements = getDataElementsWithIndexProccessing(section);

        const subsections = _(dataElements)
            .groupBy(dataElement => getSubsectionName(dataElement))
            .toPairs()
            .map(([groupName, dataElementsForGroup]): SubSectionGrid => {
                return getSubsections(groupName, dataElementsForGroup);
            })
            .value();

        const columns: Column[] = _(subsections)
            .flatMap(subsection => subsection.dataElements)
            .uniqBy(de => de.name)
            .map(de => {
                const categoryOptionCombos = de.categoryCombos.categoryOptionCombos;
                if (categoryOptionCombos.length !== 1 && categoryOptionCombos[0]?.name !== "default") {
                    return {
                        name: de.name,
                        deName: _(de.name).split(separator).head(),
                        cocName: _(de.name).split(separator).last(),
                    };
                } else {
                    return {
                        name: de.name,
                    };
                }
            })
            .value();

        const rows = subsections.map(subsection => {
            const total = totalList.find(t => t.name === subsection.name) as DataElement;

            const index = subsection.name.split(separator)[0];
            const totalRowIndex = index?.split(".")[0];

            const indexedDEs = dataElements.filter(de => {
                return totalRowIndex ? de.name.startsWith(`${totalRowIndex}.`) : [];
            });

            const section1 = section.id === "yzMn16Bp1wV";
            const hasTotals = index?.length === 3 && !_.isEmpty(totalRowIndex) && section1;
            const rowDisabled = section1 && indexedDEs.length > 1 ? index === totalRowIndex : false;

            const items = columns.map(column => {
                const dataElement = subsection.dataElements.find(de => de.name === column.name);
                let columnTotal;
                let columnDataElements;
                if (hasTotals) {
                    columnTotal = dataElements.find(de => {
                        return (
                            de.name.startsWith(`${totalRowIndex}${separator}`) &&
                            de.name.endsWith(`${dataElement?.name.split(separator)[0]}`)
                        );
                    });

                    columnDataElements = indexedDEs.filter(de => {
                        return (
                            de.name.match(/^\d.\d - /g) && de.name.endsWith(`${dataElement?.name.split(separator)[0]}`)
                        );
                    });
                }
                return { column, columnTotal, columnDataElements, dataElement };
            });

            let rowDataElements;
            if (hasTotals) {
                rowDataElements = subsection.dataElements.flatMap(de => {
                    if (de.name.endsWith("Total") || de.name.endsWith("Source Type")) {
                        return [];
                    } else {
                        return de;
                    }
                });
            }

            return {
                name: subsection.name,
                total: total,
                rowDataElements: rowDataElements,
                rowDisabled: rowDisabled,
                items: items,
            };
        });

        const useIndexes =
            _(rows).every(row => Boolean(row.name.match(/\(\d+\)$/))) &&
            _(rows)
                .groupBy(row => row.name.replace(/\s*\(\d+\)$/, ""))
                .size() === 1;

        return {
            id: section.id,
            name: section.name,
            columns: columns,
            rows: rows,
            toggle: section.toggle,
            texts: section.texts,
            useIndexes: useIndexes,
        };
    }
}

function getDataElementsWithIndexProccessing(section: Section) {
    return section.dataElements.map((dataElement): typeof dataElement => {
        // "MAL - Compound name (1)" -> "MAL (1) - Compound name"
        const index = dataElement.name.match(/\((\d+)\)$/)?.[1];

        if (!index) {
            return dataElement;
        } else {
            const parts = dataElement.name.split(separator);
            const initial = _.initial(parts).join(separator);
            const last = _.last(parts);
            if (!last) return dataElement;
            const lastWithoutIndex = last.replace(/\s*\(\d+\)$/, "");
            const newName = `${initial} (${index}) - ${lastWithoutIndex}`;
            return { ...dataElement, name: newName };
        }
    });
}

function getSubsectionName(dataElement: DataElement): string {
    // Remove index from enumerated data elements (example: `Chemical name (1)` -> `Chemical name`)
    // so they are grouped with no need to edit each name in the metadata.
    return _(dataElement.name).split(separator).initial().join(separator);
}

function getSubsections(groupName: string, groupDataElements: DataElement[]): SubSectionGrid {
    return {
        name: groupName,
        dataElements: groupDataElements.flatMap(dataElement => {
            const cocNames = dataElement.categoryCombos.categoryOptionCombos.map(coc => coc.name);

            if (cocNames.length === 1 && cocNames[0] === "default") {
                return [
                    {
                        ...dataElement,
                        name: _(dataElement.name).split(separator).last() || "-",
                    },
                ];
            } else {
                return cocNames.map(coc => ({
                    ...dataElement,
                    cocId: dataElement.categoryCombos.categoryOptionCombos.find(c => c.name === coc)?.id || "cocId",
                    name: `${_(dataElement.name).split(separator).last()} - ${coc}` || "-",
                }));
            }
        }),
    };
}
