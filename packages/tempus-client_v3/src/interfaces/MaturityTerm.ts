import { Decimal } from 'tempus-core-services';

export default interface MaturityTerm {
  apr: number | string | Decimal;
  date: Date;
}
