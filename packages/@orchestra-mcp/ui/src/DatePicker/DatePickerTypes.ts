/** A selected date with timezone context */
export interface DateTimeValue {
  date: Date;
  /** IANA timezone name, e.g. "America/New_York" */
  timezone: string;
}

/** A selected date range */
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

/** Timezone option for the picker dropdown */
export interface TimezoneOption {
  label: string;
  /** IANA timezone name */
  value: string;
  /** UTC offset description */
  description: string;
}
