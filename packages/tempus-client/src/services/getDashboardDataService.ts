import DashboardDataService from './DashboardDataService';

let dashboardDataService: DashboardDataService;
const getDashboardDataService = () => {
  if (!dashboardDataService) {
    dashboardDataService = new DashboardDataService();
  }

  return dashboardDataService;
};

export default getDashboardDataService;
