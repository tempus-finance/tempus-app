import { useTranslation } from 'react-i18next';
import { NavSubheader, NavSubheaderGroup, Typography } from '../shared';

const LiquidityProvisionSubheader = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <NavSubheader align="center">
      <NavSubheaderGroup>
        <Typography variant="title" weight="bold">
          {t('LiquidityProvisionSubheader.comingSoon')}
        </Typography>
      </NavSubheaderGroup>
    </NavSubheader>
  );
};
export default LiquidityProvisionSubheader;
