import * as moment from 'moment';

export const timeUtils = {
  startDayOfMonth(month: string): string {
    return moment(month).startOf('month').format('YYYY-MM-DD');
  },

  endDayOfMonth(month: string): string {
    return moment(month).endOf('month').format('YYYY-MM-DD');
  },

  startOfDay(day: moment.MomentInput): string {
    return moment(day).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  },

  endOfDay(day: moment.MomentInput): string {
    return moment(day).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  },

  isWeekday(day: moment.MomentInput): boolean {
    return ![6, 7].includes(moment(day).isoWeekday());
  },

  subDay(date: moment.MomentInput, days: number): string {
    return moment(date).subtract(days, 'days').format('YYYY-MM-DD');
  },

  addDay(date: moment.MomentInput, days: number): string {
    return moment(date).add(days, 'days').format('YYYY-MM-DD');
  },

  formDate(date: moment.MomentInput): string {
    return moment(date).format('YYYY/MM/DD');
  },

  formDate2(date: moment.MomentInput): string {
    return moment(date).format('YYYY-MM-DD');
  },

  formTime(date) {
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
  },

  dateOfToday(): string {
    const now = new Date();
    return timeUtils.formDate(now);
  },

  formUtcTime(date: moment.MomentInput): string {
    return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
  },

  compareDate(dateA: moment.MomentInput, dateB: moment.MomentInput) {
    const momentA = moment(dateA).format('l'),
      momentB = moment(dateB).format('l');
    if (moment(momentA).isBefore(momentB)) {
      return 'before';
    } else if (moment(momentA).isAfter(momentB)) {
      return 'after';
    } else if (moment(momentA).isSame(momentB)) {
      return 'equal';
    } else {
      return -1;
    }
  },

  addMonth(date: moment.MomentInput, months: number) {
    return moment(date).add(months, 'months').format('YYYY-MM');
  },

  subtractMonthTime(date: moment.MomentInput, months: number) {
    return moment(date)
      .subtract(months, 'months')
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
  },

  dateDiff(date1: moment.MomentInput, date2: moment.MomentInput): number {
    return moment(date1).diff(date2, 'days');
  },
};
