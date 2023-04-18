import { IPortalWidgetConfig } from "../portal/widgets";
import { ISharedWidgetConfig } from "./base";

export interface ITableWidgetConfig extends ISharedWidgetConfig {
  _type: "table";
  limit?: number;
}

export interface ISummaryWidgetConfig extends ISharedWidgetConfig {
  _type: "summary-card";
  dateField?: string;
  icon: string;
  color: string;
}

export type IWidgetConfig =
  | ITableWidgetConfig
  | ISummaryWidgetConfig
  | IPortalWidgetConfig;

export const HOME_DASHBOARD_KEY = "__home__dashboard";

export type WidgetSizes = "1" | "2" | "4";