import { Injectable } from '@angular/core';

declare global {
  interface Window {
    webkitAudioContext: {
      new (): AudioContext;
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private static SOUNDS_ROOT = '/assets/sounds/';

  private cache = new Map<string, AudioBuffer>();

  private readonly audioContext: AudioContext;

  constructor() {
    const contextClass = 'AudioContext' in window ? AudioContext : window.webkitAudioContext;
    this.audioContext = new contextClass();
  }

  async playSound(sound: string) {
    const buffer = await this.resolveAudioBuffer(sound);
    const audioSource = this.audioContext.createBufferSource();
    audioSource.buffer = buffer;
    audioSource.connect(this.audioContext.destination);
    audioSource.start();
  }

  private async resolveAudioBuffer(sound: string): Promise<AudioBuffer> {
    if (this.cache.has(sound)) {
      return Promise.resolve(this.cache.get(sound)!);
    } else {
      const response = await fetch(`${SoundService.SOUNDS_ROOT}${sound}.mp3`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.decodeArrayBuffer(arrayBuffer);
      this.cache.set(sound, audioBuffer);
      return audioBuffer;
    }
  }

  private async decodeArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      this.audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }
}
