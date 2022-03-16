import { FC, useCallback, useContext, useMemo, useState } from 'react';
import { LocaleContext } from '../../../context/localeContext';
import getText from '../../../localisation/getText';
import shortenAccount from '../../../utils/shortenAccount';
import Typography from '../../typography/Typography';
import CopyIcon from '../../icons/CopyIcon';
import Button from '../../common/Button';

import './contractAddrTooltip.scss';
import TickIcon from '../../icons/TickIcon';
import ExternalLink from '../../common/ExternalLink';

interface ContractAddrTooltipProps {
  blockExplorerUrl: string;
  tempusPoolAddress: string;
  tempusAMMAddress: string;
  tempusControllerAddress: string;
  principalsAddress: string;
  yieldsAddress: string;
  yieldBearingTokenAddress: string;
  statsAddress: string;
}

const ContractAddrTooltip: FC<ContractAddrTooltipProps> = props => {
  const {
    blockExplorerUrl,
    tempusPoolAddress,
    tempusAMMAddress,
    tempusControllerAddress,
    principalsAddress,
    yieldsAddress,
    yieldBearingTokenAddress,
    statsAddress,
  } = props;
  const { locale } = useContext(LocaleContext);

  const [showCopied, setShowCopied] = useState<string>('');
  const [timeoutFunc, setTimeoutFunc] = useState<NodeJS.Timeout>();

  const onCopy = useCallback((address: string, timeout?: NodeJS.Timeout) => {
    navigator.clipboard.writeText(address);
    setShowCopied(address);
    timeout && clearTimeout(timeout);
    setTimeoutFunc(setTimeout(() => setShowCopied(''), 1000));
  }, []);
  const onCopyTempusAMMAddress = useCallback(
    () => onCopy(tempusAMMAddress, timeoutFunc),
    [tempusAMMAddress, timeoutFunc, onCopy],
  );
  const onCopyTempusPoolAddress = useCallback(
    () => onCopy(tempusPoolAddress, timeoutFunc),
    [tempusPoolAddress, timeoutFunc, onCopy],
  );
  const onCopyTempusControllerAddress = useCallback(
    () => onCopy(tempusControllerAddress, timeoutFunc),
    [tempusControllerAddress, timeoutFunc, onCopy],
  );
  const onCopyPrincipalsAddress = useCallback(
    () => onCopy(principalsAddress, timeoutFunc),
    [principalsAddress, timeoutFunc, onCopy],
  );
  const onCopyYieldsAddress = useCallback(
    () => onCopy(yieldsAddress, timeoutFunc),
    [yieldsAddress, timeoutFunc, onCopy],
  );
  const onCopyYieldBearingTokenAddress = useCallback(
    () => onCopy(yieldBearingTokenAddress, timeoutFunc),
    [yieldBearingTokenAddress, timeoutFunc, onCopy],
  );
  const onCopyStatsAddress = useCallback(() => onCopy(statsAddress, timeoutFunc), [statsAddress, timeoutFunc, onCopy]);

  const formattedTempusAMMAddress = useMemo(() => shortenAccount(tempusAMMAddress), [tempusAMMAddress]);
  const formattedTempusPoolAddress = useMemo(() => shortenAccount(tempusPoolAddress), [tempusPoolAddress]);
  const formattedTempusControllerAddress = useMemo(
    () => shortenAccount(tempusControllerAddress),
    [tempusControllerAddress],
  );
  const formattedPrincipalsAddress = useMemo(() => shortenAccount(principalsAddress), [principalsAddress]);
  const formattedYieldsAddress = useMemo(() => shortenAccount(yieldsAddress), [yieldsAddress]);
  const formattedYieldBearingTokenAddress = useMemo(
    () => shortenAccount(yieldBearingTokenAddress),
    [yieldBearingTokenAddress],
  );
  const formattedStatsAddress = useMemo(() => shortenAccount(statsAddress), [statsAddress]);
  const copyToClipboardText = useMemo(() => getText('copyToclipboard', locale), [locale]);
  const copiedText = useMemo(() => getText('copied', locale), [locale]);

  return (
    <div className="tc__contract-addr-tooltip">
      <Typography variant="tooltip-card-title">{getText('contractAddresses', locale)}</Typography>
      <div className="tc__contract-addr-tooltip-item">
        <Typography variant="sub-title">TempusAMM</Typography>
        {showCopied === tempusAMMAddress ? (
          <>
            <TickIcon />
            <Typography variant="body-text">{copiedText}</Typography>
          </>
        ) : (
          <>
            <ExternalLink href={`${blockExplorerUrl}/address/${tempusAMMAddress}`}>
              <Typography variant="contract-addr" title={tempusAMMAddress}>
                {formattedTempusAMMAddress}
              </Typography>
            </ExternalLink>
            <Button title={copyToClipboardText} onClick={onCopyTempusAMMAddress}>
              <CopyIcon fillColor="#062330" />
            </Button>
          </>
        )}
      </div>
      <div className="tc__contract-addr-tooltip-item">
        <Typography variant="sub-title">TempusPool</Typography>
        {showCopied === tempusPoolAddress ? (
          <>
            <TickIcon />
            <Typography variant="body-text">{copiedText}</Typography>
          </>
        ) : (
          <>
            <ExternalLink href={`${blockExplorerUrl}/address/${tempusPoolAddress}`}>
              <Typography variant="contract-addr" title={tempusPoolAddress}>
                {formattedTempusPoolAddress}
              </Typography>
            </ExternalLink>
            <Button title={copyToClipboardText} onClick={onCopyTempusPoolAddress}>
              <CopyIcon fillColor="#062330" />
            </Button>
          </>
        )}
      </div>
      <div className="tc__contract-addr-tooltip-item">
        <Typography variant="sub-title">TempusController</Typography>
        {showCopied === tempusControllerAddress ? (
          <>
            <TickIcon />
            <Typography variant="body-text">{copiedText}</Typography>
          </>
        ) : (
          <>
            <ExternalLink href={`${blockExplorerUrl}/address/${tempusControllerAddress}`}>
              <Typography variant="contract-addr" title={tempusControllerAddress}>
                {formattedTempusControllerAddress}
              </Typography>
            </ExternalLink>
            <Button title={copyToClipboardText} onClick={onCopyTempusControllerAddress}>
              <CopyIcon fillColor="#062330" />
            </Button>
          </>
        )}
      </div>
      <div className="tc__contract-addr-tooltip-item">
        <Typography variant="sub-title">Principals</Typography>
        {showCopied === principalsAddress ? (
          <>
            <TickIcon />
            <Typography variant="body-text">{copiedText}</Typography>
          </>
        ) : (
          <>
            <ExternalLink href={`${blockExplorerUrl}/address/${principalsAddress}`}>
              <Typography variant="contract-addr" title={principalsAddress}>
                {formattedPrincipalsAddress}
              </Typography>
            </ExternalLink>
            <Button title={copyToClipboardText} onClick={onCopyPrincipalsAddress}>
              <CopyIcon fillColor="#062330" />
            </Button>
          </>
        )}
      </div>
      <div className="tc__contract-addr-tooltip-item">
        <Typography variant="sub-title">Yields</Typography>
        {showCopied === yieldsAddress ? (
          <>
            <TickIcon />
            <Typography variant="body-text">{copiedText}</Typography>
          </>
        ) : (
          <>
            <ExternalLink href={`${blockExplorerUrl}/address/${yieldsAddress}`}>
              <Typography variant="contract-addr" title={yieldsAddress}>
                {formattedYieldsAddress}
              </Typography>
            </ExternalLink>
            <Button title={copyToClipboardText} onClick={onCopyYieldsAddress}>
              <CopyIcon fillColor="#062330" />
            </Button>
          </>
        )}
      </div>
      <div className="tc__contract-addr-tooltip-item">
        <Typography variant="sub-title">YieldBearing Token</Typography>
        {showCopied === yieldBearingTokenAddress ? (
          <>
            <TickIcon />
            <Typography variant="body-text">{copiedText}</Typography>
          </>
        ) : (
          <>
            <ExternalLink href={`${blockExplorerUrl}/address/${yieldBearingTokenAddress}`}>
              <Typography variant="contract-addr" title={yieldBearingTokenAddress}>
                {formattedYieldBearingTokenAddress}
              </Typography>
            </ExternalLink>
            <Button title={copyToClipboardText} onClick={onCopyYieldBearingTokenAddress}>
              <CopyIcon fillColor="#062330" />
            </Button>
          </>
        )}
      </div>
      <div className="tc__contract-addr-tooltip-item">
        <Typography variant="sub-title">Stats</Typography>
        {showCopied === statsAddress ? (
          <>
            <TickIcon />
            <Typography variant="body-text">{copiedText}</Typography>
          </>
        ) : (
          <>
            <ExternalLink href={`${blockExplorerUrl}/address/${statsAddress}`}>
              <Typography variant="contract-addr" title={statsAddress}>
                {formattedStatsAddress}
              </Typography>
            </ExternalLink>
            <Button title={copyToClipboardText} onClick={onCopyStatsAddress}>
              <CopyIcon fillColor="#062330" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ContractAddrTooltip;
