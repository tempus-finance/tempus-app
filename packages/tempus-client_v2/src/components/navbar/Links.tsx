import { FC, useCallback, useContext } from 'react';
import { PoolDataContext } from '../../context/poolDataContext';
import getText, { Language } from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Languages from './Languages';
import './Links.scss';

type LinksInProps = SharedProps & { changeLanguage: any };

const Links: FC<LinksInProps> = ({ language, changeLanguage }) => {
  const { setPoolData } = useContext(PoolDataContext);

  const onChangeLanguage = useCallback(
    (language: Language) => {
      changeLanguage(language);
    },
    [changeLanguage],
  );

  const onDashboardClick = useCallback(() => {
    setPoolData && setPoolData(previousContext => ({ selectedPool: '', poolData: previousContext.poolData }));
  }, [setPoolData]);

  // TODO
  // link active state

  return (
    <div className="tc__navBar__links">
      <ul>
        <li onClick={onDashboardClick}>{getText('dashboard', language)}</li>
        <li>{getText('analytics', language)}</li>
        <li>{getText('community', language)}</li>
        <li>{getText('settings', language)}</li>
        <li>
          <Languages onChangeLanguage={onChangeLanguage} />
        </li>
      </ul>
    </div>
  );
};

export default Links;
