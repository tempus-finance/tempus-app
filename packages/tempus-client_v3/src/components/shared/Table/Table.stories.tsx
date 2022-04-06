import { ComponentStory, ComponentMeta } from '@storybook/react';
import Typography from '../Typography';

import Table from './Table';
import TableBody from './TableBody';
import TableBodyCell from './TableBodyCell';
import TableHead from './TableHead';
import TableHeadCell from './TableHeadCell';
import TableRow from './TableRow';

export default {
  title: 'Table',
  component: Table,
  argTypes: {},
} as ComponentMeta<typeof Table>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '300px',
};

const Template: ComponentStory<typeof Table> = () => (
  <div style={style}>
    <Table>
      <TableHead>
        <TableRow id="header">
          <TableHeadCell label="Pools &amp; Assets" />
          <TableHeadCell label="Protocol" align="center" />
          <TableHeadCell label="Term" />
          <TableHeadCell label="APR" />
          <TableHeadCell label="TVL" align="right" />
          <TableHeadCell label="Balance" align="right" />
          <TableHeadCell label="Avail. to Deposit" align="right" />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow id="row-a" onClick={() => {}}>
          <TableBodyCell>
            <Typography variant="body-primary">ETH</Typography>
          </TableBodyCell>
          <TableBodyCell align="center">
            <Typography variant="body-primary">Lido</Typography>
          </TableBodyCell>
          <TableBodyCell>
            <Typography variant="body-primary">Jan 1st</Typography>
          </TableBodyCell>
          <TableBodyCell>
            <Typography variant="body-primary" type="mono">
              10%
            </Typography>
          </TableBodyCell>
          <TableBodyCell align="right">
            <Typography variant="body-primary" type="mono">
              $100
            </Typography>
          </TableBodyCell>
          <TableBodyCell align="right">
            <Typography variant="body-primary" type="mono">
              $500
            </Typography>
          </TableBodyCell>
          <TableBodyCell align="right">
            <Typography variant="body-primary" type="mono">
              $1000
            </Typography>
          </TableBodyCell>
        </TableRow>
        <TableRow id="row-b" onClick={() => {}}>
          <TableBodyCell>
            <Typography variant="body-primary">USDC</Typography>
          </TableBodyCell>
          <TableBodyCell align="center">
            <Typography variant="body-primary">Yearn</Typography>
          </TableBodyCell>
          <TableBodyCell>
            <Typography variant="body-primary">Jan 1st</Typography>
          </TableBodyCell>
          <TableBodyCell>
            <Typography variant="body-primary" type="mono">
              10%
            </Typography>
          </TableBodyCell>
          <TableBodyCell align="right">
            <Typography variant="body-primary" type="mono">
              $100
            </Typography>
          </TableBodyCell>
          <TableBodyCell align="right">
            <Typography variant="body-primary" type="mono">
              $1.1k
            </Typography>
          </TableBodyCell>
          <TableBodyCell align="right">
            <Typography variant="body-primary" type="mono">
              $10M
            </Typography>
          </TableBodyCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export const Primary = Template.bind({});
