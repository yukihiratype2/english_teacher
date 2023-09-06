import assert from "assert";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { PassThrough } from "stream";

const subscriptionKey = process.env.SPEECH_SUBSCRIPTION_KEY;
const serviceRegion = "eastasia"

async function textToSpeech(text: string): Promise<ArrayBuffer> {
  assert(subscriptionKey, 'Missing SPEECH_SUBSCRIPTION_KEY');
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  );

  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus;

  speechConfig.speechSynthesisVoiceName = "en-US-AriaNeural"

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result: sdk.SpeechSynthesisResult) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(result.audioData);
        } else {
          reject(new Error(result.errorDetails));
        }
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

export { textToSpeech };