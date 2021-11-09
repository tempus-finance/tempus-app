import { FC, useState } from 'react';
import 'date-fns';
import { Box, Button, Paper, Popper, TextField } from '@material-ui/core';

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
            <div className="tf__filter__popup-row-label-container">Asset</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                placeholder="Asset name"
                fullWidth={true}
                size="small"
                value={assetName}
                onChange={onAssetNameChange}
              />
            </div>
          </div>
          <div className="tf__filter__popup-row-container">
            <div className="tf__filter__popup-row-label-container">Protocol</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                placeholder="Protocol name"
                fullWidth={true}
                size="small"
                value={protocolName}
                onChange={onProtocolNameChange}
              />
            </div>
          </div>
          <div className="tf__filter__popup-row-container">
            <div className="tf__filter__popup-row-label-container">APR range</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                fullWidth={true}
                size="small"
                placeholder="min"
                value={aPRRangeMin}
                onChange={onAPRRangeMinChange}
              />
              <p>-</p>
              <TextField
                fullWidth={true}
                size="small"
                placeholder="max"
                value={aPRRangeMax}
                onChange={onAPRRangeMaxChange}
              />
            </div>
          </div>
          <div className="tf__filter__popup-row-container">
            <div className="tf__filter__popup-row-label-container">Maturity</div>
            <div className="tf__filter__popup-row-input-container">
              <TextField
                fullWidth={true}
                size="small"
                placeholder="min"
                value={maturityRangeMin}
                onChange={onMaturityRangeMinChange}
              />
              <p>-</p>
              <TextField
                fullWidth={true}
                size="small"
                placeholder="max"
                value={maturityRangeMax}
                onChange={onMaturityRangeMaxChange}
              />
            </div>
          </div>
          <div className="tf__filter__popup-actions-container">
            <Button onClick={onClearFilters}>Clear filter</Button>
            <Box m={1} />
            <Button onClick={applyFilters} variant="contained" color="primary">
              Apply
            </Button>
          </div>
        </Paper>
      </Popper>
    </>
  );
};
export default FilterPopup;
