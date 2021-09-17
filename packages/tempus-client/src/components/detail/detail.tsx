import { FC, ChangeEvent, useEffect, useCallback, useContext, useMemo, useState } from 'react';
import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import PoolDataAdapter from '../../adapters/PoolDataAdapter';
import { Context } from '../../context';
import TokenIcon from '../tokenIcon';
import ProgressBar from '../progressBar';
import DetailBasic from './basic/detailBasic';
import DetailAdvanced from './advanced/detailAdvanced';

import './detail.scss';

type DetailInProps = {
  hidden: boolean;
  content?: any;
};

type DetailOutPros = {
  onClose: () => void;
};

type DetailProps = DetailInProps & DetailOutPros;

const Detail: FC<DetailProps> = ({ hidden, content, onClose }) => {
  const { token = '', protocol = '', maturity = new Date(), startDate, tempusPool } = content || {};

  const startToMaturity = useMemo(() => differenceInSeconds(maturity, startDate), [maturity, startDate]);
  const nowToMaturity = useMemo(() => differenceInSeconds(maturity, new Date()), [maturity]);
  const left = useMemo(() => nowToMaturity / startToMaturity, [nowToMaturity, startToMaturity]);

  const [showAdvancedUI, setShowAdvancedUI] = useState<boolean>(false);
  const [poolDataAdapter, setPoolDataAdapter] = useState<PoolDataAdapter | undefined>(undefined);

  const {
    data: { userWalletSigner, userWalletAddress },
  } = useContext(Context);

  const onInterfaceChange = useCallback(
    (_: ChangeEvent<{}>, checked: boolean) => {
      setShowAdvancedUI(checked);
    },
    [setShowAdvancedUI],
  );

  useEffect(() => {
    if (userWalletSigner) {
      setPoolDataAdapter(getPoolDataAdapter(userWalletSigner));
    }
  }, [userWalletSigner]);

  return (
    <div className="tf__detail__section__container" hidden={hidden}>
      <div className="tf__dialog-container">
        <div className="test">
          <div className="tf__dialog-container__header">
            <div className="tf__dialog-container__header-title">
              <div className="tf__dialog-container__header-summary">
                <div className="tf__dialog-container__header-summary-data">
                  <div className="tf__dialog-container__header-series">Series</div>
                  <div className="tf__dialog-container__header-series__value">
                    {token} <TokenIcon ticker={token} /> via <span>{protocol}</span>
                  </div>
                </div>
                <div className="tf__dialog-container__header-summary-bar">
                  <div className="tf__dialog-container__header-summary-time-left">
                    {maturity && `Matures ${formatDistanceToNow(maturity, { addSuffix: true })}`}
                  </div>
                  <ProgressBar value={left} />
                  <div className="tf__dialog-container__header-summary-maturity">
                    {maturity && format(maturity, 'do MMM yy')}
                  </div>
                </div>
              </div>

              <div className="tf__dialog-container__header-ui-toggle">
                <FormControl component="fieldset">
                  <FormGroup aria-label="position" row>
                    <FormControlLabel
                      value="end"
                      control={<Switch checked={showAdvancedUI} />}
                      label="Advanced"
                      labelPlacement="end"
                      onChange={onInterfaceChange}
                    />
                  </FormGroup>
                </FormControl>
              </div>
              <IconButton aria-label="close" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <div className="tf__dialog__content">
            {showAdvancedUI ? (
              <DetailAdvanced content={content} />
            ) : (
              <DetailBasic
                content={content}
                tempusPool={tempusPool}
                signer={userWalletSigner}
                userWalletAddress={userWalletAddress}
                poolDataAdapter={poolDataAdapter}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
