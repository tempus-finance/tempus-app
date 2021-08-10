import { FC, useState } from 'react';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import { TableFilterRow } from '@devexpress/dx-react-grid-material-ui';
import { Filter } from '@devexpress/dx-react-grid';

type ChipFilterInProps = {
  id: string;
  filter: any;
  column: any;
  filteringEnabled: boolean;
  tableColumn: any;
  tableRow: any;
  values: string[];
};

type ChipFilterOutProps = {
  onFilter: (filter: Filter | null) => void;
  getMessage: (messageKey: string) => string;
};

type ChipFilterProps = ChipFilterInProps & ChipFilterOutProps;

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 300,
      marginTop: 0,
      marginBottom: 2,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  });
});

function getStyles(value: string, values: string[], theme: Theme) {
  return {
    fontWeight: values.indexOf(value) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  };
}

const ITEM_HEIGHT = 46;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ChipFilter: FC<ChipFilterProps> = props => {
  // console.log('ChipFilterProps props', props);
  const { values, id, onFilter } = props;

  const classes = useStyles();
  const theme = useTheme();
  const [chips, setChips] = useState<string[]>([]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setChips(event.target.value as string[]);
    onFilter({ columnName: props.column.name, value: (event.target.value as string[]).join(' ') });
  };

  const renderValue = (selected: any) => (
    <div className={classes.chips}>
      {(selected as string[]).map(value => (
        <Chip key={value} label={value} className={classes.chip} />
      ))}
    </div>
  );

  return (
    <TableFilterRow.Cell {...props} className="tf__dashboard__filter__chip">
      <FormControl className={classes.formControl}>
        <InputLabel id={`${id}-label`}></InputLabel>
        <Select
          id={`${id}-select`}
          className="tf__dashboard__filter__chip-select"
          labelId="tf-chip-label"
          multiple
          value={chips}
          onChange={handleChange}
          input={<Input id={`${id}-select-multiple-chip`} />}
          renderValue={renderValue}
          MenuProps={MenuProps}
        >
          {values.map((value: string) => (
            <MenuItem key={value} value={value} style={getStyles(value, values, theme)}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </TableFilterRow.Cell>
  );
};

export default ChipFilter;
