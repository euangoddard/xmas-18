import { Injectable } from '@angular/core';

declare global {
  interface Window {
    gtag: Function;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  sendPageView(urlPath: string): void {
    window.gtag('config', 'UA-131047329-1', {
      page_path: urlPath,
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  sendEvent(action: string, params: GtagEvent): void {
    window.gtag('event', action, params);
  }
}

export interface GtagEvent {
  event_category?: string;
  event_label?: string;
  value?: any;
  [key: string]: any;
}
