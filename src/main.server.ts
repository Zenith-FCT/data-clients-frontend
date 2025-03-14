import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// This is important for Angular SSR - the default export must be a function
// that returns a Promise that resolves to the bootstrapped application
export default async function bootstrap() {
  return bootstrapApplication(AppComponent, config);
}
