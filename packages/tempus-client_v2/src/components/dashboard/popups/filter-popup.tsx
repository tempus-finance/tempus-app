import { FC, useContext, useState } from 'react';
import 'date-fns';
import { Box, Button, InputAdornment, Paper, Popper, TextField } from '@material-ui/core';
import { LanguageContext } from '../../../context/languageContext';
import getText from '../../../localisation/getText';

import './filter-popup.scss';

export interface FilterData {
  assetName: string;
  protocolName: string;
  aPRRange: {
    min: number | null;
    max: number | null;
  };
  maturityRange: {
    min: number | null;
    max: number | null;
  };
}

interface FilterPopupProps {
  open: boolean;
  anchor: HTMLElement | null;
  onFilter: (filterData: FilterData | null) => void;
  onClose: () => void;
}

const FilterPopup: FC<FilterPopupProps> = (props: FilterPopupProps) => {
  const { open, anchor, onFilter, onClose } = props;

  const { language } = useContext(LanguageContext);

  const [assetName, setAssetName] = useState<string>('');
  const [protocolName, setProtocolName] = useState<string>('');
  const [aPRRangeMin, setAPRRangeMin] = useState<string>('');
  const [aPRRangeMax, setAPRRangeMax] = useState<string>('');
  const [maturityRangeMin, setMaturityRangeMin] = useState<string>('');
  const [maturityRangeMax, setMaturityRangeMax] = useState<string>('');

  const onAssetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssetName(event.target.value);
  };

  const onProtocolNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProtocolName(event.target.value);
  };

  const onAPRRangeMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAPRRangeMin(event.target.value);
  };

  const onAPRRangeMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAPRRangeMax(event.target.value);
  };

  const onMaturityRangeMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaturityRangeMin(event.target.value);
  };

  const onMaturityRangeMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaturityRangeMax(event.target.value);
  };

  const onClearFilters = () => {
    setAssetName('');
    setProtocolName('');
    setAPRRangeMin('');
    setAPRRangeMax('');
    setMaturityRangeMin('');
    setMaturityRangeMax('');

    onFilter(null);
  };

  const applyFilters = () => {
    onFilter({
      assetName,
      protocolName,
      aPRRange: {
        min: aPRRangeMin ? Number(aPRRangeMin) / 100 : null,
        max: aPRRangeMax ? Number(aPRRangeMax) / 100 : null,
      },
      maturityRange: {
        min: maturityRangeMin ? Number(maturityRangeMin) : null,
        max: maturityRangeMax ? Number(maturityRangeMax) : null,
      },
    });
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="tf__backdrop" onClick={onClose} />
      <Popper className="tf__filter__popup-popper" open={open} anchorEl={anchor} placement="bottom">
        <Paper className="tf__filter__popup-container">
          <div className="tf__filter__popup-row-container">
            <div className="tf__filter__popup-row-label-container">{getText('asset', language)}</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                placeholder={getText('assetName', language)}
                fullWidth={true}
                size="small"
                value={assetName}
                onChange={onAssetNameChange}
              />
            </div>
          </div>
          <div className="tf__filter__popup-row-container">
            <div className="tf__filter__popup-row-label-container">{getText('protocol', language)}</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                placeholder={getText('protocolName', language)}
                fullWidth={true}
                size="small"
                value={protocolName}
                onChange={onProtocolNameChange}
              />
            </div>
          </div>
          <div className="tf__filter__popup-row-container">
            <div className="tf__filter__popup-row-label-container">{getText('aprRange', language)}</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                fullWidth={true}
                size="small"
                placeholder={getText('min', language)}
                value={aPRRangeMin}
                onChange={onAPRRangeMinChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              <p>-</p>
              <TextField
                fullWidth={true}
                size="small"
                placeholder={getText('max', language)}
                value={aPRRangeMax}
                onChange={onAPRRangeMaxChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </div>
          </div>
          <div className="tf__filter__popup-row-container">
            <div className="tf__filter__popup-row-label-container">{getText('maturity', language)}</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                fullWidth={true}
                size="small"
                placeholder={getText('min', language)}
                value={maturityRangeMin}
                onChange={onMaturityRangeMinChange}
              />
              <p>-</p>
              <TextField
                fullWidth={true}
                size="small"
                placeholder={getText('max', language)}
                value={maturityRangeMax}
                onChange={onMaturityRangeMaxChange}
              />
            </div>
          </div>
          <div className="tf__filter__popup-actions-container">
            <Button onClick={onClearFilters}>{getText('clearFilter', language)}</Button>
            <Box m={1} />
            <Button onClick={applyFilters} variant="contained" color="primary">
              {getText('apply', language)}
            </Button>
          </div>
        </Paper>
      </Popper>
    </>
  );
};
export default FilterPopup;
