import { useTranslation } from 'react-i18next';
import { NavSubheader, NavSubheaderGroup, Typography } from '../shared';

const StakingSubheader = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <NavSubheader align="center">
      <NavSubheaderGroup>
        <Typography variant="title" weight="bold">
          {t('StakingSubheader.comingSoon')}
        </Typography>
      </NavSubheaderGroup>
    </NavSubheader>
  );
};
export default StakingSubheader;
