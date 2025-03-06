/**
 * Enumeración de tipos de gráficos soportados
 */
export enum ChartTypes {
  BAR = 'bar',
  PIE = 'pie',
  LINE = 'line'
}

/**
 * Interfaz para datos de gráfico de pie
 */
export interface PieChartData {
  labels: string[];
  values: number[];
}

/**
 * Interfaz para datos de gráfico de línea
 */
export interface LineChartData {
  labels: string[];
  values: number[];
  label: string;
}

/**
 * Interfaz para datos de gráfico de barras
 */
export interface BarChartData {
  labels: string[];
  values: number[];
}

/**
 * Interfaz base para builders de gráficos
 */
export interface ChartBuilder {
  destroy(): void;
}