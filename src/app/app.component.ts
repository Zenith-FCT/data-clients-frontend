import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'data-clients-frontend';

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.removeMargins(document.documentElement);
      this.removeMargins(document.body);
      
      this.detectAndRemoveMargins();
    }
  }

  private removeMargins(element: HTMLElement) {
    this.renderer.setStyle(element, 'margin', '0');
    this.renderer.setStyle(element, 'padding', '0');
  }

  private detectAndRemoveMargins() {
    const elements = document.querySelectorAll('body > *');
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const margin = style.margin;
      const padding = style.padding;
      
      if (margin !== '0px' || padding !== '0px') {
        console.log('Elemento con margen/padding detectado:', el);
        this.renderer.setStyle(el, 'margin', '0');
        this.renderer.setStyle(el, 'padding', '0');
      }
    });
  }
}
