import { Chart, ChartEvent, ActiveElement } from "chart.js";
import { LineChartBuilder } from "./builders/line-chart.builder";
import { PieChartBuilder } from "./builders/pie-chart.builder";
import { BarChartBuilder } from "./builders/bar-chart.builder"; // Importar el nuevo BarChartBuilder
import { 
  ChartTypes, 
  BarChartData, 
  LineChartData, 
  PieChartData,
  ChartBuilder as IChartBuilder
} from "../domain/models/chart.model";

/**
 * Factory para la creación centralizada de gráficos
 * Implementa el patrón Factory para crear diferentes tipos de gráficos
 */
export class ChartFactory {
  // Mapa para almacenar las instancias de builder
  private static builders: Map<ChartTypes, any> = new Map();
  
  /**
   * Crea un gráfico de barras
   * @param canvasId ID del elemento canvas
   * @param data Datos para el gráfico
   * @param title Título del gráfico
   * @param onClick Manejador de eventos de click (opcional)
   * @returns Instancia de Chart o null si hay error
   */
  public static createBarChart(
    canvasId: string,
    data: BarChartData,
    title: string,
    onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  ): Chart | null {
    try {
      this.destroyBuilder(ChartTypes.BAR);
      // Usar BarChartBuilder en lugar de ChartBuilder
      const builder = new BarChartBuilder(canvasId);
      this.builders.set(ChartTypes.BAR, builder);
      return builder.createBarChart(data, title, onClick);
    } catch (error) {
      console.error('Error creating bar chart:', error);
      return null;
    }
  }

  /**
   * Crea un gráfico de línea
   * @param canvasId ID del elemento canvas
   * @param data Datos para el gráfico
   * @param title Título del gráfico
   * @param onClick Manejador de eventos de click (opcional)
   * @returns Instancia de Chart o null si hay error
   */
  public static createLineChart(
    canvasId: string,
    data: LineChartData,
    title: string,
    onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  ): Chart | null {
    try {
      this.destroyBuilder(ChartTypes.LINE);
      const builder = new LineChartBuilder(canvasId);
      this.builders.set(ChartTypes.LINE, builder);
      return builder.createLineChart(data, title, onClick);
    } catch (error) {
      console.error('Error creating line chart:', error);
      return null;
    }
  }

  /**
   * Crea un gráfico de pie
   * @param canvasId ID del elemento canvas
   * @param data Datos para el gráfico
   * @param title Título del gráfico
   * @param onClick Manejador de eventos de click (opcional)
   * @returns Instancia de Chart o null si hay error
   */
  public static createPieChart(
    canvasId: string,
    data: PieChartData,
    title: string,
    onClick?: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void
  ): Chart | null {
    try {
      this.destroyBuilder(ChartTypes.PIE);
      const builder = new PieChartBuilder(canvasId);
      this.builders.set(ChartTypes.PIE, builder);
      return builder.createPieChart(data, title, onClick);
    } catch (error) {
      console.error('Error creating pie chart:', error);
      return null;
    }
  }
  
  /**
   * Destruye todos los gráficos y limpia los builders
   */
  public static destroyCharts(): void {
    for (const type of Array.from(this.builders.keys())) {
      this.destroyBuilder(type);
    }
  }

  /**
   * Destruye un builder específico
   * @param type Tipo de builder a destruir
   */
  private static destroyBuilder(type: ChartTypes): void {
    const builder = this.builders.get(type);
    if (builder) {
      builder.destroy();
      this.builders.delete(type);
    }
  }
}