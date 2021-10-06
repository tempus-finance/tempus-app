import { format } from 'date-fns';

export function formatDate(
    date:Date|number,
    fmt: string,
    options?: {
      locale?: Locale
      weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
      firstWeekContainsDate?: number
      useAdditionalWeekYearTokens?: boolean
      useAdditionalDayOfYearTokens?: boolean
    }
):string {
    let newDate:Date = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    return format(newDate, fmt, options);
}