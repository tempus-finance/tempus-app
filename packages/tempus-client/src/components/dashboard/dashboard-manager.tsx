import { FC } from 'react';
import getDashboardDataService from '../../services/getDashboardDataService';
import Dashboard from './dashboard';

const DashboardManager: FC = (): JSX.Element => {
  const rows = getDashboardDataService().getRows();

  const onRowActionClick = (row: any) => {
    console.log(row);
    alert('here goes the pop up!');
  };

  return (
    <div className="tf__dashboard__section__container">
      <div className="tf__dashboard__container">
        <Dashboard rows={rows} onRowActionClick={onRowActionClick} />
      </div>
    </div>
  );
};

export default DashboardManager;
