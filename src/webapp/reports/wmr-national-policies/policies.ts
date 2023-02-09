const DATASET_COLUMNS = [
    "POLICY_ADOPTED",
    "IMPLEMENTED",
    "POLICY_SINCE",
    "IMPLEMENTED_THIS_YEAR",
    "POLICY_DISCONTINUED",
] as const;

type Columns = typeof DATASET_COLUMNS[number];

interface Policy {
    code: string;
    items: Array<{
        code: string;
        hidden?: boolean;
        columns: Partial<Record<Columns, { dataElement: string; categoryOptionCombo: string }>>;
    }>;
}

// TODO: Delete file
export const policies: Policy[] = [
    {
        code: "LLINS",
        items: [
            {
                code: "MAL_ITN_LLIN_DISTR_FREE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "rZWKpbFRNCU", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "OUjryjwW8WN", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "SRaBwrvxVIb", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "H3LCc4WIDsB", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "SiSRJevJZ4T", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_FREE_ALL_AGES",
                columns: {
                    POLICY_ADOPTED: { dataElement: "yDjBgnk5zGo", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "uGGIB4kUBmQ", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "HUB9PZj8tyX", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "RHBES4RE2O9", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "JdlSOTAegA1", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_FREE_CHILDREN",
                columns: {
                    POLICY_ADOPTED: { dataElement: "FYDXDlWDj9q", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "NcKys1jDcLe", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "OXpRtOaN1Be", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "UtiOr1tVoZ0", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "G5346yuPsAT", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_FREE_PW",
                columns: {
                    POLICY_ADOPTED: { dataElement: "BKboGW8jXHq", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Xp7l9g3LV1R", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "xbY1MDRHSMT", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "m4d4wrtNHJB", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "axC7rVVOY2a", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_FREE_OTHER",
                columns: {
                    POLICY_ADOPTED: { dataElement: "bDbY6XRrJSe", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "kAKCTb87ipF", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "NiJYnuPWdxd", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "BFaFQnCLmXA", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "uhkoNUfG241", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "LBL_SPECIFY_OTHER_GROUPS",
                columns: { POLICY_ADOPTED: { dataElement: "MwhoTZsoZxq", categoryOptionCombo: "Xr12mI7VPn3" } },
            },
        ],
    },
    {
        code: "LLIN_DISTR_CHANNELS",
        items: [
            {
                code: "MAL_ITN_LLIN_DISTR_VIA_ANC",
                columns: {
                    POLICY_ADOPTED: { dataElement: "sFMFEBTMPXc", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "rt9hmeObLjT", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "U3jTvbMNbhw", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "irqN8OmIXac", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "yueUKrDt7Ah", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_VIA_EPI",
                columns: {
                    POLICY_ADOPTED: { dataElement: "ZM8A8AX9Uqm", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "JNCgQR1p3qg", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "P3d0Pl4huHd", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "D4A8YcaqjeU", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "QWzYONBamuO", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_VIA_MASS_CAMP",
                columns: {
                    POLICY_ADOPTED: { dataElement: "RTQVnaIWlV7", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "kWumx3IhOdf", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "wgwQAH2zsxI", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "G09VqCTjEkB", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "gwTbg0RjYNE", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_VIA_SCHOOLS",
                columns: {
                    POLICY_ADOPTED: { dataElement: "U53ltdOJwGr", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "P1hh3NtXPhC", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "bCAwiQMRC0c", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "SBhEVrMFoir", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "GtHRqwzbI90", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_VIA_WORK",
                columns: {
                    POLICY_ADOPTED: { dataElement: "UEI17GN1tET", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "PaAVAOVW7Gb", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "IK7g1GVqiX4", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "JlsDrFROFRO", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "EupH4G8cgY7", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ITN_LLIN_DISTR_VIA_PRIV",
                columns: {
                    POLICY_ADOPTED: { dataElement: "ZRka5cXrk8P", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "mjTD406azlx", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "VqejpNrDAmu", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "Y03Ulmb5ltG", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "tcAlZmlC66o", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
        ],
    },
    {
        code: "LBL_IRS",
        items: [
            {
                code: "MAL_IRS_RECOM",
                columns: {
                    POLICY_ADOPTED: { dataElement: "naWHvRDZaWO", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "up7awAqkJcb", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "lZHkoFkBLRe", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "DhFZK3yA1zo", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "acR3jZoBx8F", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_IRS_PRIMARY_VC",
                columns: {
                    POLICY_ADOPTED: { dataElement: "q61cZM2jEon", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "v2i16dOEBQI", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "EMCN2tX7NGT", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "jOQj3cZ9xUw", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "mLoGqiT1RdT", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_IRS_USED_PREVENT_EPIDEMICS",
                columns: {
                    POLICY_ADOPTED: { dataElement: "lP4Pu1doSyB", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "rE9UeQDPVOP", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "rz15cZmfmCL", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "v60Na7P1hIQ", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "jY2M20OmVR0", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_DDT_USED_IRS",
                columns: {
                    POLICY_ADOPTED: { dataElement: "jvvwOFoTKGu", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "mjsfzGpCjmd", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "r5mG7cGdlkH", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "Xnye2KDG6EP", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "SQKO1XRqSCp", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
        ],
    },
    {
        code: "LBL_LARVAL_SOUREC_MGMT",
        items: [
            {
                code: "MAL_USE_LARVAL_CONTROL",
                columns: {
                    POLICY_ADOPTED: { dataElement: "qC5iyJOhLn2", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Mf7j5h89Z3u", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "gcXYyqBzxXA", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "pZrVqaLVInj", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "az7lVJr7Hn8", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_LARVAL_CONTROL_SRC_MGMT",
                columns: {
                    POLICY_ADOPTED: { dataElement: "TVhY0NY6D3R", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Kya2L5AqV5E", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "RXLvZ9aXDS9", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "DYLCyyGwEQx", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "Qv9tOpR58eZ", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
        ],
    },
    {
        code: "LBL_TESTING",
        items: [
            {
                code: "MAL_G6PD_TEST_B4_PQ_TRT_RECOM",
                columns: {
                    POLICY_ADOPTED: { dataElement: "bAJHvHwOiBs", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "tOgKq4RmnBg", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "ovcCvwQdfiL", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "eh8XQ7NgmWO", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "XBJBXPZ9WlF", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "DIAG_RDT_FREE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "p9s4Xz11r8m", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "FVD0jjcn4nP", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "o7MInLdf5Z2", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "JUiGpi5P8ju", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "kio4hrSj8pf", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "DIAG_MICR_FREE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "s66uz2mlZOX", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "j52Vpz7UDOt", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "hRiivp9odhv", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "TLTUPA1kcDj", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "SjsxYzWMUCA", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "DIAG_FREE_PRIV_SECTOR",
                columns: {
                    POLICY_ADOPTED: { dataElement: "a5rxNWDu6ND", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "q9Ccf2WXiAO", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "XJTekRKtQGK", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "O5ZYeFhyYEt", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "qORp1JfpH2d", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_RDTS_USED_PUB_SECTOR",
                columns: {
                    POLICY_ADOPTED: { dataElement: "mKG75pqVpXg", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "ZcUXrzCAIB9", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "VTAYPeVkcBF", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "Jxh9MbkARxC", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "trwVQRFP8vj", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_RDTS_USED_PRIV_SECTOR",
                columns: {
                    POLICY_ADOPTED: { dataElement: "AUjiOdwT8Wn", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "BNa9heCe1Nl", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "ONjIkPH2myF", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "LheiO0tMDog", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "XlhCNzaxtrw", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_RDTS_USED_COMM_SECTOR",
                columns: {
                    POLICY_ADOPTED: { dataElement: "ploO0YNKd5a", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "w9qztWYO5i0", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "FCCr4AinirM", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "gZgNSaKXmzk", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "fnaxnk7DWfF", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
        ],
    },
    {
        code: "LBL_TREATMENT",
        items: [
            {
                code: "MAL_ACT_USED_TRT_PF",
                columns: {
                    POLICY_ADOPTED: { dataElement: "eOyht8mse92", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "pchgYl0bzmn", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "Y13HDxQTlWx", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "xFt2hUzfEuP", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "GF9Ng0ViLaG", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ACT_FREE_OF_CHARGE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "ZQOHdFNywH6", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Vupf1GerGAd", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "ndcOkUcvcU9", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "C8nzpEz8XUl", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "xM7utsu6NiL", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ACT_COMM_LEVEL",
                columns: {
                    POLICY_ADOPTED: { dataElement: "QnYNFyu8N2y", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "tgs8KfBR1bF", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "rUHuR8yXOYk", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "c6gaOWkexnq", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "yMwlzzsKUGq", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_TRT_PERMITTED_PRIV_SECTOR",
                columns: {
                    POLICY_ADOPTED: { dataElement: "oRom00n1H7Y", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "z0il90UtnBs", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "MguPqQxoBat", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "WSgsAIjCquS", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "kDFQMzj0fkn", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_TRT_FREE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "GjESfWGoBeN", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "A05QQoopq4G", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "bkWLd6lJpS2", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "UOYnjeA1lGY", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "XjfeTCqtg0D", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_SALE_ORAL_MONO_THERAP_POLICY_IMPL",
                columns: {
                    POLICY_ADOPTED: { dataElement: "xh8QNPzoqmD", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "sYyikWmeUw9", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "aVStylHJZmn", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "O3FeNUyyjfy", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "qIwGXEjB56Z", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_SINGLE_DOSE_PQ_USED",
                columns: {
                    POLICY_ADOPTED: { dataElement: "K7ahxoNzbs5", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Q5U5qOGMFC0", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "hHjcjfipjW4", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "Uu8jN9vG1nO", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "syFnfDC7nlJ", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_PQ_USED_RADICAL_TRT_PV",
                columns: {
                    POLICY_ADOPTED: { dataElement: "JmT6tIkb1Zh", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "bHxX9jUArH5", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "GiNL3Qt3zX5", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "PO8P5dcPXFm", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "XIG2vUYtyQx", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "DOSAGE_PQ_RADICAL_TRT_PV",
                columns: { POLICY_ADOPTED: { dataElement: "aLWOXICfAbR", categoryOptionCombo: "Xr12mI7VPn3" } },
            },
            {
                code: "PREREFERRAL_ART_SUPP_COMM",
                columns: {
                    POLICY_ADOPTED: { dataElement: "b8dAN9UE8sb", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "TiMPVn8ICcJ", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "VDC37sLx5oP", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "qvK2yZgZgof", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "wNQpGDUlJS1", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "PREREFERRAL_PAR_ARTEMISININ_QN_HF",
                columns: {
                    POLICY_ADOPTED: { dataElement: "UlpO1TVOJtp", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "euLvYczDAP7", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "gOsKbAAEDQr", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "HJ8ExjnHoVH", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "TGwYfwhhuC2", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "PREREFERRAL_PAR_QN_ART_INJ_SUPP",
                columns: {
                    POLICY_ADOPTED: { dataElement: "jexXrz9Cxbu", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "KDpQmYQYlsW", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "Ayy9KULbWGx", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "U0SLFojXPO4", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "gSpeOhdDBak", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_DOT_PQ",
                columns: {
                    POLICY_ADOPTED: { dataElement: "HBn02tSFqfN", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "zhXjM9t5VMr", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "t4oRh6EB4S8", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "mPVnnGMTNs2", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "OShPwoZP6il", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
        ],
    },
    {
        code: "LBL_IPT",
        items: [
            {
                code: "MAL_IPTI_USED",
                columns: {
                    POLICY_ADOPTED: { dataElement: "Xj8nWX2HkQG", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "fap0UwYTAjU", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "oh5Qxv9TYsx", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "Q5xzplqImL1", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "FsmAYoRmbEH", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_IPTP_POLICY_2012_UPDATE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "VVOq1qQRozh", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Mf3ICRzjDyw", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "PYZSNnU6Gph", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "xBs136rXfwY", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "tXPZLuXEFsq", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_IPTP_USED_TO_PREVENT",
                columns: {
                    POLICY_ADOPTED: { dataElement: "jnVcCWGqihW", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "ZHeALbJT1tu", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "dZI3r5zehOg", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "haNA2i5YxvN", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "qujudta3Pex", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_SMC_USED",
                columns: {
                    POLICY_ADOPTED: { dataElement: "vkMV2g3kJ1g", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "m8eKnjxlGJL", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "bf1dYW0jOSM", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "jJjiDnAXoxY", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "Ah1iagfLmQb", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
        ],
    },
    {
        code: "LBL_SURVEILLANCE",
        items: [
            {
                code: "MAL_NOTIFIABLE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "cmV3wJcGs4I", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "sLQSqJnsRdQ", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "ttkWtog3tiR", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "NcnExR16cUV", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "EWyubrRmYrE", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_RPRT_CASE_BASED",
                columns: {
                    POLICY_ADOPTED: { dataElement: "nCI8KywrLcd", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "df6ccB8aaZ3", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "rrOg5YMCsxE", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "CGcFRpi7mvP", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "kqukN1EWgxf", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_RPRT_AGGREGATE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "NPr5Na7DcQz", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "crrBdyuqVrg", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "AInD4zCo4zR", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "tDnZGTBHnKz", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "qUWxy2cDMgk", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_CASES_RPRT_MANDATORY",
                columns: {
                    POLICY_ADOPTED: { dataElement: "OH42ETptS96", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "dA9AshgLjjH", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "i5bcGsyGIzL", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "hX5kxI4Mkb4", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "sqikPX7vTE4", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_UNCOMP_PF_ADMITTED",
                columns: {
                    POLICY_ADOPTED: { dataElement: "cO6vnCdT4tj", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "e8A8G6KNWmM", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "KHmyC20WcAr", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "kuZSCCSMMVB", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "EHwRPdPkIHT", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_UNCOMP_PV_ADMITTED",
                columns: {
                    POLICY_ADOPTED: { dataElement: "lD0hUkeSlE6", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "jH3PQmQbIw0", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "NZvyh0q8gjy", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "oziRqANbkVS", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "zLVFuDdBxTP", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_INSECTICIDE_RESIST_MONIT",
                columns: {
                    POLICY_ADOPTED: { dataElement: "P3RE2qDiS7n", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "M3XOHsKwjxJ", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "SbbEta60oWB", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "t471xne4uE1", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "Fj5HRjN9aA3", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_LLIN_DURABILITY_MON",
                columns: {
                    POLICY_ADOPTED: { dataElement: "m4bkYxbSCED", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "yQnhJmEzuJw", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "uHOog71dclE", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "QMPIKtBjTwP", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "yQ0n2kVLXiH", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_IRS_RESID_EFFIC_MON",
                columns: {
                    POLICY_ADOPTED: { dataElement: "RYq4k5pS1hg", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "sMF7QOp27QY", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "btpgTyr6xfj", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "fvELUayURNw", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "hYHBA09jBG2", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_NAT_IR_MON_MGMT_PLAN",
                columns: {
                    POLICY_ADOPTED: { dataElement: "JdiTRWo6M4J", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "g8esBUsVl2g", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "q2DWg3hYm9Q", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "CccLkBGvsCd", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "gx42GBTDMyK", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_TES_MONIT_UNDERTAKEN",
                columns: {
                    POLICY_ADOPTED: { dataElement: "XrnPNV1b70D", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "eWjwshZorEK", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "qCLFL3NxBQT", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "MvaM8cvWzho", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "vBR2G1D4upc", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_SYS_MONIT_ADVERSE_REACTIONS",
                columns: {
                    POLICY_ADOPTED: { dataElement: "IcAzwmTb76p", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "AC9S95GmtOO", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "yCTGT2evVYr", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "kjPMBhJL0Cj", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "G0K6VV33VDe", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_MASS_SCRNG",
                columns: {
                    POLICY_ADOPTED: { dataElement: "YVHoYyOh65u", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "t7abky7P2vW", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "hW9fBorFC8F", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "yftwRrUC8Ls", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "LUCrwuDHFmZ", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ACD_REACTIV_RESPONSE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "c0kojhDq27P", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Nkv7Wacx0jR", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "qJdINzqpp2n", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "JmTQMI5kx9u", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "ooqolQKMQDd", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_ACD_FEBR_COMM",
                columns: {
                    POLICY_ADOPTED: { dataElement: "qd7Gk3XiUZb", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "rTDNngUcDnd", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "h3A7CjBzIfs", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "fvGcXcgMPZY", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "GwLGbdLCN0q", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_FOCI_INVEST_UNDERTAKEN",
                columns: {
                    POLICY_ADOPTED: { dataElement: "WlinYsETMHm", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "ResSID6ylaB", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "vK6l48R26nF", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "PX06zlhP72R", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "iULVtIg5elG", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_CASE_INVEST_UNDERTAKEN",
                columns: {
                    POLICY_ADOPTED: { dataElement: "tjHjmTfEGNl", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "O81a2TpBWau", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "uBPnlwBtl7r", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "toNku6ySXk4", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "BKFcemI9hjS", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_CASE_CLASS_UNDERTAKE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "TNVYRWpQGjW", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "QdEWfZIaXhO", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "qxwTiXmIuXe", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "dhTtzvnNgnZ", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "yUQHQdfOXHC", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_FOCI_CLASS_UNDERTAKE",
                columns: {
                    POLICY_ADOPTED: { dataElement: "nTnYdwVIxuA", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "Hd46aPFN7yJ", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "NilcuvQ9TBJ", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "mRpS6mENbUw", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "u1RRAbdCErK", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_NAT_REF_LABS",
                columns: {
                    POLICY_ADOPTED: { dataElement: "yGBVWQvROG5", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "qWsWn7M1bPN", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "vavn59onPeR", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "oBKJW2ep82G", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "zjp7fQjwWaa", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_NAT_QUALITY_ASSURANCE_LABS",
                columns: {
                    POLICY_ADOPTED: { dataElement: "daprCGceyb0", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "GFANFeQJ9yV", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "HIbMBtGuSPG", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "GD4BwWpzr8E", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "mJP8CaKiGlM", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
            {
                code: "MAL_RESPONSE_TEAMS_EXISTS",
                columns: {
                    POLICY_ADOPTED: { dataElement: "ZqsaRcmfIVh", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED: { dataElement: "q0xSOb0q81g", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_SINCE: { dataElement: "fcRi61ExG13", categoryOptionCombo: "Xr12mI7VPn3" },
                    IMPLEMENTED_THIS_YEAR: { dataElement: "NiH7engQGKs", categoryOptionCombo: "Xr12mI7VPn3" },
                    POLICY_DISCONTINUED: { dataElement: "GeDjXzvcjFj", categoryOptionCombo: "Xr12mI7VPn3" },
                },
            },
        ],
    },
];

const translations: Record<string, Record<string, string>> = {
    LBL_FORM_TITLE: {
        en: "World Malaria Report",
        fr: "Rapport sur le paludisme modiale",
        es: "Informe Mundial del Paludismo",
        pt: "Relatório Mundial de Malária",
    },
    LLINS: {
        en: "ITNs (All ITNs, ,LLINs, PBOs)",
        fr: "MII (tous les MIIs, MILDs, MILDs PBO)",
        es: "MTIs (todas los MTIs, MTILDs, PBO MTILDs)",
        pt: "MILDs (Todos MILDs, MILDS BOP)",
    },
    MAL_ITN_LLIN_DISTR_FREE: {
        en: "ITNs/ LLINs are distributed for free",
        fr: "Les MII/MILD sont distribuées gratuitement",
        es: "Los MTI/MTILDs se distribuyen gratuitamente",
        pt: "MILDs distribuídos gratuitamente",
    },
    MAL_ITN_LLIN_DISTR_FREE_ALL_AGES: {
        en: "ITNs/LLINs are distributed for free - for all ages groups",
        fr: "Les MII/MILD sont distribués gratuitement - pour tous les groupes d'âge",
        es: "Los MTI/MTILDs se distribuyen gratuitamente - para todos los grupos de edad",
        pt: "MILDs distribuídos gratuitamente - para todos os grupos de idade",
    },
    MAL_ITN_LLIN_DISTR_FREE_CHILDREN: {
        en: "ITNs/LLINs are distributed for free - for children",
        fr: "Les MII/MILD sont distribués gratuitement - pour les enfants",
        es: "Los MTI/MTILDs se distribuyen gratuitamente - para los niños",
        pt: "MILDs distribuídos gratuitamente - para crianças",
    },
    MAL_ITN_LLIN_DISTR_FREE_PW: {
        en: "ITNs/LLINs are distributed for free - for pregnant women",
        fr: "Les MII/MILD sont distribués gratuitement - pour les femmes enceintes",
        es: "Los MTI/MTILDs se distribuyen gratuitamente - para las mujeres embarazadas",
        pt: "MILDs distribuídos gratuitamente para gestantes",
    },
    MAL_ITN_LLIN_DISTR_FREE_OTHER: {
        en: "ITNs/LLINs are distributed for free - other at risk populations e.g forest workers",
        fr: "Les MII/MILD sont distribuées gratuitement - autres populations à risque, ar exemple les travailleurs forestiers",
        es: "Los MTI/MTILDs se distribuyen gratuitamente - otras poblaciones en riesgo, por ejemplo, los trabajadores forestales",
        pt: "MILDs distribuídos gratuitamente - para outras populações sob risco (ex. trabalhadores florestais)",
    },
    LLIN_DISTRIBUTION_CHANNELS: {
        en: "ITN distribution channels (ITNs, LLINs, PBOs)",
        fr: "Distribution des MILD (MIIs, MILDs, MILDs PBOs)",
        es: "Distribución de las MTIs (MTIs, MTILDs, PBO MTILDs)",
        pt: "Canais de distribioção de MILD (MILD, BOP)",
    },
    MAL_ITN_LLIN_DISTR_VIA_ANC: {
        en: "ITNs/ LLINs are distributed through antenatal clinics",
        fr: "Les MII/MILD sont distribuées par les cliniques prénatales",
        es: "Los MTI/MTILDs se distribuyen a través de las clínicas prenatales.",
        pt: "MILDs distribuídos em clínicas pré-natais",
    },
    MAL_ITN_LLIN_DISTR_VIA_EPI: {
        en: "ITNs/ LLINs are distributed through EPI clinics",
        fr: "Les MII/MILD sont distribuées par les cliniques du PEV",
        es: "Los MTI/MTILDs son distribuídos por las clínicas EPI.",
        pt: "MILDs distribuídos em postos de vacinação",
    },
    MAL_ITN_LLIN_DISTR_VIA_MASS_CAMP: {
        en: "ITNs/ LLINs distributed through mass campaigns to all age groups",
        fr: "Distribution de MII/MILD par des campagnes de masse à tous les groupes d'âge",
        es: "Distribución de MTI/MTILDs a través de campañas masivas a todos los grupos de edad",
        pt: "MILDs distribuídos gratuitamente através de campanhas em massa para todos os grupos de idade",
    },
    MAL_ITN_LLIN_DISTR_VIA_SCHOOLS: {
        en: "ITNs/LLINs distributed through schools, faith- and community-based networks, and agricultural and food-security support schemes",
        fr: "MII/MILD distribués par l'intermédiaire des écoles, des réseaux religieux et communautaires, et des programmes de soutien à l'agriculture et à la sécurité alimentaire",
        es: "MTI/MTILDs distribuídos a través de escuelas, redes religiosas y comunitarias y planes de apoyo a la agricultura y la seguridad alimentaria",
        pt: "MILDs distribuídos nas escolas, estabelecimentos religiosos, comunidades, planos de apoio à agricultura e segurança alimentar",
    },
    MAL_ITN_LLIN_DISTR_VIA_WORK: {
        en: "ITNs/LLINs distributed through occupation-related distribution channels",
        fr: "MII/MILD distribuées par les canaux de distribution liés à la profession",
        es: "MTI/MTILDs distribuídos a través de canales de distribución relacionados con la profesión",
        pt: "MILDs distribuídos através de canais relacionados com a profissão",
    },
    MAL_ITN_LLIN_DISTR_VIA_PRIV: {
        en: "ITNs/LLINs distributed through private or commercial sector channels",
        fr: "MII/MILD distribués par des canaux du secteur privé ou commercial",
        es: "MTI/MTILDs distribuídos a través de canales del sector privado o comercial",
        pt: "MILDs distribuídos através de canais do setor privado ou comercial",
    },
    MAL_IRS_RECOM: {
        en: "IRS is recommended by malaria control program",
        fr: "Le PID est recommandée par le programme de lutte contre le paludisme",
        es: "El RIR está recomendado por el Programa de Control de la Malaria.",
        pt: "BRI é recomendada pelo programa de controle de malária",
    },
    MAL_IRS_PRIMARY_VC: {
        en: "IRS is the primary vector control intervention",
        fr: "Le PID est la principale intervention de lutte contre les vecteurs",
        es: "La RIR es la principal intervención de control de vectores.",
        pt: "BRI é a principal intervenção de controle vetorial",
    },
    MAL_IRS_USED_PREVENT_EPIDEMICS: {
        en: "IRS is used for prevention and control of epidemics",
        fr: "Le PID sont utilisés pour la prévention et le contrôle des épidémies",
        es: "Las RIR se utilizan para la prevención y el control de epidemias",
        pt: "BRI é usada para prevenção e controle de epidemias",
    },
    MAL_DDT_USED_IRS: {
        en: "DDT is used for IRS",
        fr: "Le DDT est utilisé pour Le PID",
        es: "El DDT se usa para la RIR.",
        pt: "DDT é utilizado para a BRI",
    },
    LARVAL_CONTROL: {
        en: "Larval control",
        fr: "Lutte contre les larves",
        es: "Control de larvas",
        pt: "Controle larvário",
    },
    MAL_USE_LARVAL_CONTROL: {
        en: "Use of larval source management",
        fr: "Utilisation de la gestion des sources larvaires",
        es: "UUtilización de la gestión de la fuente de las larvas",
        pt: "Uso do manejo dos criadouros",
    },
    MAL_LARVAL_CONTROL_SRC_MGMT: {
        en: "larval source management in foci response",
        fr: "gestion des sources larvaires dans les foyers de réaction",
        es: "gestión de las fuentes de larvas en los focos de reacción",
        pt: "Manejo dos criadouros em resposta ao foco",
    },
    TESTING: {
        en: "Testing",
        fr: "Test",
        es: "Prueba",
        pt: "Teste",
    },
    DIAG_RDT_FREE: {
        en: "Malaria diagnosis using RDT is free of charge in the public sector",
        fr: "Le diagnostic du paludisme à l'aide de la TDR est gratuit dans le secteur public",
        es: "El diagnóstico del paludismo mediante los PDR es gratuito en el sector público",
        pt: "Diagnóstico de malária por TDR gratuito no setor público",
    },
    DIAG_MICR_FREE: {
        en: "Malaria diagnosis using microscopy is free of charge in the public sector",
        fr: "Le diagnostic du paludisme par microscopie est gratuit dans le secteur public",
        es: "El diagnóstico del paludismo por microscopía es gratuito en el sector público",
        pt: "Diagnóstico de malária por microscopia gratuito no setor público",
    },
    DIAG_FREE_PRIV_SECTOR: {
        en: "Malaria diagnosis is free in the private sector",
        fr: "Le diagnostic du paludisme est gratuit dans le secteur privé",
        es: "El diagnóstico de la malaria es gratuito en el sector privado",
        pt: "Diagnóstico de malária gratuito no setor privado",
    },
    MAL_RDTS_USED_PUB_SECTOR: {
        en: "RDTS are used in the public sector",
        fr: "Les TDRs sont utilisés dans le secteur public",
        es: "Los PDR se utilizan en el sector público",
        pt: "TDR utilizado no setor público",
    },
    MAL_RDTS_USED_PRIV_SECTOR: {
        en: "RDTS are used in the private sector",
        fr: "Les TDRs sont utilisés dans le secteur privé",
        es: "Los PDR se utilizan en el sector privado",
        pt: "TDR utilizado no setor privado",
    },
    MAL_RDTS_USED_COMM_SECTOR: {
        en: "RDTS are used in the community",
        fr: "Les RDTS sont utilisés dans la communauté",
        es: "Los RDTS se usan en la comunidad",
        pt: "TDR utilizado nas comunidades",
    },
    MAL_ACT_USED_TRT_PF: {
        en: "ACT is used for treatment <i>P. falciparum</i>",
        fr: "le CTA est utilisé pour le traitement <i>P. falciparum</i>",
        es: "La TCA se utiliza para el tratamiento de la fibrilación auricular",
        pt: "ACT é utilizado para tratamento de  <i>P. falciparum</i>",
    },
    MAL_ACT_FREE_OF_CHARGE: {
        en: "ACT is free of charge for all age groups in public sector",
        fr: "Les CTAs est gratuit pour toutes les tranches d'âge dans le secteur public",
        es: "Los TCA son gratuitos para todos los grupos de edad del sector público",
        pt: "ACT é gratuito para todos os grupos de idade no setor público",
    },
    MAL_ACT_COMM_LEVEL: {
        en: "ACT is delivered at community level through community agents (beyond the health facilities)",
        fr: "Les CTAs sont dispensés au niveau communautaire par des agents communautaires (au-delà des établissements de santé)",
        es: "Los TCA son administrados a nivel comunitario por trabajadores de la comunidad (más allá de los centros de salud).",
        pt: "ACT é administrado nas comunidades por trabalhadores da comunidade (além das unidades de saúde)",
    },
    MAL_TRT_PERMITTED_PRIV_SECTOR: {
        en: "Malaria treatment is permitted in the private sector",
        fr: "Le traitement du paludisme est autorisé dans le secteur privé",
        es: "El tratamiento del paludismo está permitido en el sector privado",
        pt: "Tratamento de malária é permitido no setor privado",
    },
    MAL_TRT_FREE: {
        en: "Malaria treatment is free of charge in the private sector",
        fr: "Le traitement du paludisme est gratuit dans le secteur privé",
        es: "El tratamiento del paludismo es gratuito en el sector privado",
        pt: "Tratamento da malária é gratuito no setor privado",
    },
    MAL_SALE_ORAL_MONO_THERAP_POLICY_IMPL: {
        en: "The sale of oral artemisinin-based monotherapy drugs",
        fr: "La vente de médicaments oraux en monothérapie à base d'artémisinine",
        es: "La venta de medicamentos de monoterapia con artemisinina oral",
        pt: "A venda de medicamentos de monoterapia à base de artemisinina",
    },
    MAL_PREREF_QN_ART_IM_OR_SUPP: {
        en: "Pre-referral treatment with quinine or artemether IM or artesunate suppositories",
        fr: "Traitement de pré-référence avec des suppositoires de quinine ou d'artéméther IM ou d'artésunate",
        es: "Tratamiento previo a la remisión con quinina o artemetero IM o supositorios de artesunato",
        pt: "Tratamento prévio com quinino ou artemeter IM ou supositório de artesunato",
    },
    MAL_SINGLE_DOSE_PQ_USED: {
        en: "Single low dose of primaquine with ACT to reduce transmissibility of <i>P. falciparum</i>",
        fr: "Une faible dose unique de primaquine avec CTA utilisée pour réduire la transmissibilité de <i>P. falciparum</i>",
        es: "Una única dosis baja de primaquina con ACT para reducir la transmisibilidad de <i>P. falciparum</i>.",
        pt: "Dose única baixa de primaquina com ACT para reduzir a transmissibilidade de <i>P. falciparum</i>",
    },
    MAL_PQ_USED_RADICAL_TRT_PV: {
        en: "Primaquine is used for radical treatment of <i>P. vivax</i> cases",
        fr: "La primaquine est utilisée pour le traitement radical des cas de <i>P. vivax</i>",
        es: "La primaquina se utiliza para el tratamiento radical de los casos de <i>P. vivax</i>.",
        pt: "Primaquina é utilizada para o tratamento de cura radical de casos de <i>P. vivax</i>",
    },
    MAL_G6PD_TEST_B4_PQ_TRT_RECOM: {
        en: "G6PD test is recommended before treatment with primaquine",
        fr: "Le test G6PD est recommandé avant le traitement par la primaquine",
        es: "Se recomienda la prueba de G6PD antes del tratamiento con primaquina.",
        pt: "Teste de G6PD é recomendado antes do tratamento com primaquina",
    },
    MAL_DOT_PQ: {
        en: "Directly observed treatment with primaquine is undertaken",
        fr: "Un traitement sous observation directe avec la primaquine est entrepris",
        es: "Se realiza un tratamiento con primaquina bajo observación directa.",
        pt: "Tratamento observado com primaquina é realizado",
    },
    IPT: {
        en: "IPT",
        fr: "TPI",
        es: "IPT",
        pt: "Tratamento Preventivo Intermitente (TPI)",
    },
    MAL_IPTI_USED: {
        en: "IPTi is used",
        fr: "L'TPIi est utilisé",
        es: "El IPTi se utiliza",
        pt: "TPIi é utilizado",
    },
    MAL_IPTP_POLICY_2012_UPDATE: {
        en: "IPTp policy has been updated following the WHO policy recommendation",
        fr: "La politique IPTp a été mise à jour suite à la recommandation de l'OMS",
        es: "La política del IPTp ha sido actualizada siguiendo la recomendación de la OMS",
        pt: "A política de TPIp foi atualizada de acordo com a recomendação da OMS",
    },
    MAL_IPTP_USED_TO_PREVENT: {
        en: "IPTp used to prevent malaria during pregnancy",
        fr: "Le TPIp utilisé pour prévenir le paludisme pendant la grossesse",
        es: "El IPTp utilizado para prevenir la paludismo en el embarazo",
        pt: "TPIp é usado para prevenção de malária durante a gravidez",
    },
    MAL_SMC_USED: {
        en: "Seasonal malaria chemoprevention (SMC or IPTc) is used",
        fr: "La chimioprévention du paludisme saisonnier (SMC ou TPIc) est utilisée",
        es: "Se utiliza la quimioprevención de la paludismo estacional (SMC o IPTc)",
        pt: "Quimioprofilaxia (QPX ou TPIc) sazonal de malária é realizada",
    },
    MAL_NOTIFIABLE: {
        en: "Malaria is notifiable disease",
        fr: "Le paludisme est une maladie à déclaration obligatoire",
        es: "El paludismo es una enfermedad de declaración obligatoria",
        pt: "Malária é uma doença de notificação compulsória",
    },
    MAL_RPRT_CASE_BASED: {
        en: "Reporting of cases to the national level is aggregate",
        fr: "La déclaration des cas au niveau national est agrégée",
        es: "La notificación de casos a nivel nacional se agrega",
        pt: "A notificação de casos a nível nacional é agregada",
    },
    MAL_RPRT_AGGREGATE: {
        en: "Reporting of cases to the national level case based",
        fr: "Signalement des cas au niveau national sur la base des cas",
        es: "Notificación de casos nacionales",
        pt: "Notificação de casos nacionais ",
    },
    MAL_CASES_RPRT_MANDATORY: {
        en: "Case reporting from private sector is mandatory",
        fr: "La déclaration des cas par le secteur privé est obligatoire",
        es: "La notificación de los casos por parte del sector privado es obligatoria.",
        pt: "Notificação de casos do setor privado é obrigatória",
    },
    MAL_UNCOMP_PF_ADMITTED: {
        en: "Uncomplicated <i>P. falciparum</i> cases are routinely admitted",
        fr: "Les cas de <i>P. falciparum</i> non compliqués sont couramment admis",
        es: "Los casos no complicados de <i>P. falciparum</i> son admitidos rutinariamente.",
        pt: "Casos não complicados de <i>P. falciparum</i>  são admitidos rotineiramente",
    },
    MAL_UNCOMP_PV_ADMITTED: {
        en: "Uncomplicated <i>P. vivax</i> cases are routinely admitted",
        fr: "Les cas de <i>P. vivax</i> non compliqués sont systématiquement admis",
        es: "Los casos no complicados de <i>P. vivax</i> son admitidos rutinariamente",
        pt: "Casos não complicados de <i>P. vivax</i> são admitidos rotineiramente",
    },
    MAL_INSECTICIDE_RESIST_MONIT: {
        en: "Insecticide resistance monitoring is undertaken",
        fr: "La surveillance de la résistance aux insecticides est entreprise",
        es: "Se está llevando a cabo una vigilancia de la resistencia a los insecticidas.",
        pt: "É realizado o monitoramento da resistência",
    },
    MAL_LLIN_DURABILITY_MON: {
        en: "LLIN durability is regularly monitored",
        fr: "La durabilité des MILD est régulièrement contrôlée",
        es: "La durabilidad de las MTILDs se monitoriza regularmente",
        pt: "Durabilidade dos MILDs monitorada regularmente",
    },
    MAL_IRS_RESID_EFFIC_MON: {
        en: "IRS residual efficacy is regularly monitored",
        fr: "L'efficacité résiduelle des PID est régulièrement contrôlée",
        es: "La eficacia residual de las EPI se vigila periódicamente.",
        pt: "Eficácia residual é monitorada regularmente",
    },
    MAL_NAT_IR_MON_MGMT_PLAN: {
        en: "National Insecticide Resistance Monitoring and Management Plan",
        fr: "Plan national de surveillance et de gestion de la résistance aux insecticides",
        es: "Plan Nacional de Vigilancia y Gestión de la Resistencia a los Insecticidas",
        pt: "Plano Nacional de Manejo e Monitoramento da Resistência aos Inseticidas",
    },
    MAL_TES_MONIT_UNDERTAKEN: {
        en: "Therapeutic efficacy monitoring is undertaken",
        fr: "La surveillance de l'efficacité thérapeutique est entreprise",
        es: "Se realiza la supervisión de la eficacia terapéutica",
        pt: "Monitoramento da eficácia terapêutica é realizada",
    },
    MAL_SYS_MONIT_ADVERSE_REACTIONS: {
        en: "System for monitoring of adverse reaction to antimalarials exists",
        fr: "Il existe un système de surveillance des effets indésirables des antipaludiques",
        es: "Existe un sistema de vigilancia de los efectos adversos de los medicamentos antipalúdicos.",
        pt: "Existe um sistema de vigilância dos efeitos adversos aos medicamentos antimaláricos",
    },
    MAL_MASS_SCRNG: {
        en: "ACD for mass screening (including non-febrile)",
        fr: "DAC pour le dépistage de masse (y compris les personnes non fébriles)",
        es: "DAC para la detección masiva (incluyendo las no febriles)",
        pt: "DAC para a detecção em massa (incluindo os não febris)",
    },
    MAL_ACD_REACTIV_RESPONSE: {
        en: "ACD in response to passively detected case (reactive)",
        fr: "DAC en réponse à un cas détecté passivement (réactif)",
        es: "DAC en respuesta a un caso detectado pasivamente (reactivo)",
        pt: "DAC em resposta s um caso detectado de forma passiva (reativa)",
    },
    MAL_ACD_FEBR_COMM: {
        en: "ACD of febrile cases at community level (pro-active)",
        fr: "DAC des cas fébriles au niveau communautaire (pro-actif)",
        es: "DAC de casos febriles a nivel comunitario (pro-activo)",
        pt: "DAC de casos febris a nível comunitário (pró-ativa)",
    },
    MAL_FOCI_INVEST_UNDERTAKEN: {
        en: "Foci investigation undertaken",
        fr: "Enquête sur les foyers entreprise",
        es: "Encuesta de hogares realizada",
        pt: "Investigação de focos é realizada",
    },
    MAL_CASE_INVEST_UNDERTAKEN: {
        en: "Case investigation undertaken",
        fr: "Enquête sur les cas entreprise",
        es: "Investigación del caso emprendida",
        pt: "Investigação de casos é realizada",
    },
    MAL_CASE_CLASS_UNDERTAKE: {
        en: "Case classification undertaken",
        fr: "Classification des cas entreprise",
        es: "Clasificación de los casos realizados",
        pt: "Classificação do caso é realizada",
    },
    MAL_FOCI_CLASS_UNDERTAKE: {
        en: "Foci classification undertaken",
        fr: "Classification des foyers entreprise",
        es: "Clasificación de los hogares de la empresa",
        pt: "Classificação do foco é realizada",
    },
    MAL_NAT_REF_LABS: {
        en: "National reference laboratory is internationally certified",
        fr: "Le laboratoire national de référence est certifié au niveau international",
        es: "El laboratorio nacional de referencia está certificado internacionalmente.",
        pt: "O laboratório nacional de referência está certificado internacionalmente",
    },
    MAL_NAT_QUALITY_ASSURANCE_LABS: {
        en: "Quality assurance oversight by national reference laboratory",
        fr: "Surveillance de l'assurance qualité par le laboratoire national de référence",
        es: "Vigilancia de la garantía de calidad por el laboratorio nacional de referencia",
        pt: "Supervisão da garantia de qualidade pelo laboratório nacional de referência",
    },
    MAL_RESPONSE_TEAMS_EXISTS: {
        en: "Response teams exist, or are formed when needed, to respond to malaria cases",
        fr: "Des équipes d'intervention existent, ou sont formées si nécessaire, pour répondre aux cas de paludisme",
        es: "Existen equipos de respuesta, o se les capacita si es necesario, para responder a los casos de paludismo",
        pt: "Existe equipes de resposta, ou é formada, em resposta à um caso de malária",
    },
    POLICY: {
        en: "Policy",
        fr: "Politique",
        es: "Política",
        pt: "Políticas implementadas nacionalmente",
    },
    POLICY_ADOPTED: {
        en: "Written policy exists",
        fr: "Politique écrite existante",
        es: "Existe una política escrita",
        pt: "Existe uma política escrita",
    },
    IMPLEMENTED: {
        en: "Policy implemented (please tick yes if 'ever' implemented)",
        fr: "Politique mise en œuvre (veuillez cocher oui si elle a déjà été mise en œuvre par le passé)",
        es: "Policía implementada (por favor marque sí si 'alguna vez' se implementó)",
        pt: "Política implementada (marque sim se 'alguma vez' implementada)",
    },
    POLICY_SINCE: {
        en: "<b>Year</b> the policy was implemented for the first time)",
        fr: "<b>Année</b> où la politique a été mise en œuvre pour la première fois",
        es: "La política del <b>año</b> se aplicó por primera vez",
        pt: "<b> Ano </b> em que a política foi implementada pela primeira vez)",
    },
    IMPLEMENTED_THIS_YEAR: {
        en: "Implemented this year",
        fr: "Mis en œuvre cette année",
        es: "Implementado este año",
        pt: "implementado este ano",
    },
    POLICY_DISCONTINUED: {
        en: "Policy discontinued",
        fr: "Politique abandonnée",
        es: "Política descontinuada",
        pt: "Política descontinuada",
    },
    REMARKS: {
        en: "Remarks",
        fr: "Commentaires",
        es: "Comentarios",
        pt: "Comentários",
    },
    IRS: {
        en: "<b>IRS</b>",
        fr: "<b>PID</b>",
        es: "<b>RIR</b>",
        pt: "<b>BRI</b>",
    },
    DIAGNOSIS: {
        en: "<b>Diagnosis</b>",
        fr: "<b>Diagnostic</b>",
        es: "<b>Diagnóstico</b>",
        pt: "<b>Diagnóstico</b>",
    },
    TREATMENT: {
        en: "<b>Treatment</b>",
        fr: "<b>Traitement</b>",
        es: "<b>Tratamiento</b>",
        pt: "<b>Tratmento</b>",
    },
    SURVEILLANCE: {
        en: "<b>Surveillance</b>",
        fr: "<b>Surveillance</b>",
        es: "<b>Vigilancia</b>",
        pt: "<b>Vigilância</b>",
    },
    OTHER_POLICIES_RELATED_TO_ELIMINATION: {
        en: "<b>Other policies related to elimination phase</b>",
        fr: "<b>Autres politiques liées à la phase d'élimination</b>",
        es: "<b>Otras políticas relacionadas con la fase de eliminación</b>",
        pt: "<b>Outras políticas relacionadas com a fase de eliminação</b>",
    },
    QUESTION_ON_MAIN_FORM: {
        en: "This question is also asked in the main form",
        fr: "Cette question est également posée dans le formulaire principal",
        es: "Esta pregunta también se hace en el formulario principal",
        pt: "Esta pergunta também é realizada no formulário principal",
    },
    LBL_SPECIFY_OTHER_GROUPS: {
        en: "Please specify other distribution group selected above",
        fr: "Veuillez préciser l'autre groupe de distribution sélectionné ci-dessus",
        es: "Sírvase especificar otro grupo de distribución seleccionado anteriormente",
        pt: "Por favor, especifique outro grupo de distribuição selecionado acima",
    },
    LBL_TESTING: {
        en: "Testing",
        fr: "Test",
        es: "Prueba",
        pt: "Teste",
    },
    LBL_LARVAL_SOUREC_MGMT: {
        en: "Larval source management",
        fr: "Gestion des sources larvaires",
        es: "Manejo de la fuente larvaria",
        pt: "Manejo de criadouros",
    },
    LBL_IPT: {
        en: "IPT",
        fr: "TPI",
        es: "TPI",
        pt: "TPI",
    },
    LBL_TREATMENT: {
        en: "Treatment",
        fr: "Traitement",
        es: "Tratamiento",
        pt: "Tratamento",
    },
    LBL_SURVEILLANCE: {
        en: "Surveillance",
        fr: "Surveillance",
        es: "Vigilancia",
        pt: "Vigilância",
    },
    LBL_IRS: {
        en: "IRS",
        fr: "PID",
        es: "RRI",
        pt: "BRI",
    },
    LLIN_DISTR_CHANNELS: {
        en: "LLIN distribution channels",
        fr: "Canaux de distribution des MILD",
        es: "Canales de distribución de MTILDs",
        pt: "Canais de distribioção de MILD",
    },
    PREREFERRAL_ART_SUPP_COMM: {
        en: "Pre-referral Rx with artesunate suppositories at community level",
        fr: "Réception pré-référence avec des suppositoires d'artésunate au niveau de la communauté",
        es: "Pre-referencia Rx con supositorios de artesunato a nivel comunitario.",
        pt: "Supositório retal de artesunato pré-transferência em nível comunitário",
    },
    PREREFERRAL_PAR_ARTEMISININ_QN_HF: {
        en: "Pre-referral Rx with parentral artemisinin/ quinine derivatives at health facilities",
        fr: "Réception pré-référence avec des dérivés d'artémisinine / quinine parentral dans les établissements de santé",
        es: "Pre-referencia Rx con derivados de artemisinina / quinina parenteral en instalaciones de salud",
        pt: "Derivados de artemisinina / quinina parenteral pré-transferiencia nos estabelecimentos de saúde",
    },
    PREREFERRAL_PAR_QN_ART_INJ_SUPP: {
        en: "Pre-referral treatment with quinine or artemether IM or artesunate suppositories",
        fr: "Traitement préalable à la référence avec de la quinine ou de l'artéméther IM ou des suppositoires d'artésunate",
        es: "Tratamiento previo a la derivación con quinina o artemeter IM o supositorios de artesunato.",
        pt: "Tratamento pré-encaminhamento com quinino ou artemeter IM ou supositórios de artesunato",
    },
    DOSAGE_PQ_RADICAL_TRT_PV: {
        en: "Dosage of primaquine for radical treatment of P. vivax",
        fr: "Posologie de la primaquine pour le traitement radical de P. vivax",
        es: "Dosificación de primaquina para el tratamiento radical de P. vivax",
        pt: "Dosagem de primaquina para tratamento radical de P. vivax",
    },
};

export {};
