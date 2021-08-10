export const dashboardColumnsDefinitions = [
  {
    name: 'token',
    title: 'Asset',
  },
  {
    name: 'protocol',
    title: 'Protocol',
  },

  {
    name: 'fixedAPY',
    title: 'Fixed APR',
    type: 'number',
    getCellValue: (row: any) => {
      if (row.fixedAPY.length === 2) {
        return row.fixedAPY;
      }
      return [row.fixedAPY];
    },
  },
  {
    name: 'variableAPY',
    title: 'Variable APR',
    getCellValue: (row: any) => {
      if (row.variableAPY.length === 2) {
        return row.variableAPY;
      }
      return [row.variableAPY];
    },
  },
  {
    name: 'maturity',
    title: 'Maturity',
    getCellValue: (row: any) => {
      if (row.maturity.length === 2) {
        const [min, max] = row.maturity;
        return [min.getTime(), max.getTime()];
      }
      return [row.maturity.getTime()];
    },
  },
  {
    name: 'TVL',
    title: 'TVL',
    getCellValue: (row: any) => {
      return row.TVL;
    },
  },
  {
    name: 'balance',
    title: 'Balance',
    getCellValue: (row: any) => {
      return new Intl.NumberFormat().format(row.balance);
    },
  },
  {
    name: 'availableToDeposit',
    title: 'Avail to Deposit',
  },
];
