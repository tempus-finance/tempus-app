import SidebarDataAdapter from './SidebarDataAdapter';

let sidebarDataAdapter: SidebarDataAdapter;
const getSidebarDataAdapter = (): SidebarDataAdapter => {
  if (!sidebarDataAdapter) {
    sidebarDataAdapter = new SidebarDataAdapter();
  }

  return sidebarDataAdapter;
};

export default getSidebarDataAdapter;
