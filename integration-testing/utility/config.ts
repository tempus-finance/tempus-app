import { config as denvconfig } from 'dotenv';
denvconfig();

export default {
    METAMASK_RECOVERY_PHRASE: process.env.METAMASK_RECOVERY_PHRASE ?? '',
    METAMASK_PASSWORD: process.env.METAMASK_PASSWORD ?? '',
    METAMASK_ACCOUNT_ETH_FORK: process.env.METAMASK_ACCOUNT_ETH_FORK ?? '',
    METAMASK_ACCOUNT_FANTOM: process.env.METAMASK_ACCOUNT_FANTOM ?? '',
    CI: Boolean(process.env.CI),
    LOCALHOST: process.env.LOCALHOST == 't',
};
