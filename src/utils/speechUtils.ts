
/**
 * Utility functions for Deepgram TTS and STT API interactions
 */

const MAX_RETRIES = 10;

// Text-to-Speech conversion
export async function textToSpeech(text: string): Promise<string> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      
      if (!apiKey) {
        throw new Error("Deepgram API key is not configured");
      }
      
      const response = await fetch("https://api.deepgram.com/v1/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${apiKey}`,
        },
        body: JSON.stringify({
          text,
          voice: "hera-en",
          model: "aura-asteria-en",
          encoding: "linear16",
          sample_rate: 24000,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Deepgram TTS API error: ${response.status} ${response.statusText}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
      
    } catch (error) {
      console.error("TTS API error:", error);
      retries++;
      
      if (retries >= MAX_RETRIES) {
        throw new Error(`Failed to convert text to speech after ${MAX_RETRIES} retries: ${error}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  throw new Error("Failed to convert text to speech");
}

// Speech-to-Text conversion
export async function speechToText(audioBlob: Blob): Promise<string> {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
      
      if (!apiKey) {
        throw new Error("Deepgram API key is not configured");
      }
      
      const response = await fetch("https://api.deepgram.com/v1/listen", {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiKey}`,
        },
        body: audioBlob,
      });
      
      if (!response.ok) {
        throw new Error(`Deepgram STT API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.results.channels[0].alternatives[0].transcript;
      
    } catch (error) {
      console.error("STT API error:", error);
      retries++;
      
      if (retries >= MAX_RETRIES) {
        throw new Error(`Failed to convert speech to text after ${MAX_RETRIES} retries: ${error}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  throw new Error("Failed to convert speech to text");
}

// Audio recording utility
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  async start(): Promise<void> {
    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.start();
    } catch (error) {
      console.error("Failed to start audio recording:", error);
      throw new Error("Could not access microphone. Please ensure microphone permissions are enabled.");
    }
  }
  
  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("Recording has not been started"));
        return;
      }
      
      this.mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        
        // Stop all audio tracks
        if (this.stream) {
          this.stream.getAudioTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        resolve(audioBlob);
      });
      
      this.mediaRecorder.stop();
    });
  }
}

// Audio playback utility using Howler
export function playAudio(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Dynamic import to avoid SSR issues
      import('howler').then(({ Howl }) => {
        const sound = new Howl({
          src: [src],
          html5: true,
          onend: () => {
            resolve();
          },
          onloaderror: (id, err) => {
            reject(new Error(`Failed to load audio: ${err}`));
          },
          onplayerror: (id, err) => {
            reject(new Error(`Failed to play audio: ${err}`));
          }
        });
        
        sound.play();
      }).catch(reject);
    } catch (error) {
      reject(new Error(`Failed to initialize audio playback: ${error}`));
    }
  });
}
