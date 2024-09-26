import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaptureService {
  public captureRequested = new EventEmitter<void>();

  requestCapture() {
    this.captureRequested.emit();
  }
}