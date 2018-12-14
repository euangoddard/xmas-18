import { Injectable } from '@angular/core';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor() {
    this.addScript();
    window.dataLayer = window.dataLayer || [];
    this.gtag('js', new Date());
    this.gtag('config', 'UA-131047329-1', { send_page_view: false });
  }

  sendPageView(urlPath: string): void {
    this.gtag('config', 'UA-131047329-1', { page_path: urlPath });
  }

  private gtag(...args: any[]): void {
    window.dataLayer!.push(args);
  }

  private addScript(): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-131047329-1';
    const first = document.getElementsByTagName('script')[0]!;
    first.parentNode!.insertBefore(script, first);
  }
}
