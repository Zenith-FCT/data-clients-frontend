import { Chart } from "chart.js";
import { ChartBuilder } from "../../domain/models/chart.model";

/**
 * Builder abstracto que servirá como base para todos los builders de gráficos
 */
export abstract class AbstractChartBuilder implements ChartBuilder {
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;
  protected _chart: Chart | null = null;

  constructor(protected canvasId: string) {
    console.log(`Initializing ${this.constructor.name} with canvas ID: ${canvasId}`);
  }

  get chart(): Chart | null {
    return this._chart;
  }

  /**
   * Inicializa el canvas y su contexto
   * @returns true si se inicializó correctamente, false en caso contrario
   */
  protected initializeCanvas(): boolean {
    if (this.canvas && this.ctx) {
      return true;
    }

    console.log('Initializing canvas with id:', this.canvasId);
    
    const canvas = document.getElementById(this.canvasId);
    
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      console.error(`Canvas with id ${this.canvasId} not found or is not a canvas element`);
      return false;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Failed to get 2D context from canvas');
      return false;
    }

    this.canvas = canvas;
    this.ctx = context;
    return true;
  }

  /**
   * Destruye el gráfico y limpia las referencias
   */
  public destroy(): void {
    if (this._chart) {
      console.log(`Destroying chart in ${this.constructor.name}`);
      this._chart.destroy();
      this._chart = null;
    }
    
    // Limpiar referencias
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.canvas = null;
    this.ctx = null;
  }
}