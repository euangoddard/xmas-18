import { Injectable } from '@angular/core';

declare global {
  interface Window {
    webkitAudioContext: {
      new (): AudioContext;
    };
  }
}

export const enum Sound {
  Present = 'present',
  Grinch = 'grinch',
}

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private static SOUNDS_ROOT = '/assets/sounds/';

  private cache = new Map<Sound, AudioBuffer>();

  private readonly audioContext: AudioContext;

  constructor() {
    const contextClass = 'AudioContext' in window ? AudioContext : window.webkitAudioContext;
    this.audioContext = new contextClass();
  }

  async playSound(sound: Sound) {
    const buffer = await this.resolveAudioBuffer(sound);
    const audioSource = this.audioContext.createBufferSource();
    audioSource.buffer = buffer;
    audioSource.connect(this.audioContext.destination);
    audioSource.start();
  }

  private async resolveAudioBuffer(sound: Sound): Promise<AudioBuffer> {
    if (this.cache.has(sound)) {
      return Promise.resolve(this.cache.get(sound)!);
    } else {
      const arrayBuffer = await this.fetchSound(sound);
      const audioBuffer = await this.decodeArrayBuffer(arrayBuffer);
      this.cache.set(sound, audioBuffer);
      return audioBuffer;
    }
  }

  private async fetchSound(sound: Sound): Promise<ArrayBuffer> {
    const request = new XMLHttpRequest();
    request.open('GET', `${SoundService.SOUNDS_ROOT}${sound}.mp3`, true);
    request.responseType = 'arraybuffer';
    const promise = new Promise<ArrayBuffer>((resolve, reject) => {
      request.onload = () => {
        resolve(request.response);
      };
      request.onerror = err => reject(err);
    });
    request.send();
    return promise;
  }

  private async decodeArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      this.audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }
}
