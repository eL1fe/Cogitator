import {
  Cogitator,
  Agent,
  createTranscribeAudioTool,
  createGenerateSpeechTool,
} from '../packages/core/src';
import fs from 'fs';
import path from 'path';

async function main() {
  const cog = new Cogitator({
    llm: {
      defaultProvider: 'openai',
      providers: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY!,
        },
      },
    },
  });

  const transcribeAudio = createTranscribeAudioTool({
    apiKey: process.env.OPENAI_API_KEY!,
    defaultModel: 'whisper-1',
  });

  const generateSpeech = createGenerateSpeechTool({
    apiKey: process.env.OPENAI_API_KEY!,
    defaultVoice: 'nova',
    defaultModel: 'tts-1-hd',
  });

  const audioAgent = new Agent({
    name: 'audio-assistant',
    model: 'openai/gpt-4o',
    instructions: `You are an audio-capable AI assistant.
You can transcribe audio files and generate speech from text.

When transcribing audio:
- Use transcribeAudio to convert speech to text
- Report the language detected and duration
- Summarize or analyze the content as requested

When generating speech:
- Use generateSpeech to create audio from text
- Choose appropriate voices for the content
- Adjust speed for clarity or effect`,
    tools: [transcribeAudio, generateSpeech],
  });

  console.log('=== Audio Agent Example ===\n');

  console.log('1. Generating speech from text...');
  const speechResult = await cog.run(audioAgent, {
    input:
      'Generate speech saying: "Hello! Welcome to Cogitator, the sovereign AI agent runtime. I can transcribe audio and generate natural-sounding speech."',
  });
  console.log('Speech generation result:', speechResult.output);
  console.log('Tokens used:', speechResult.usage?.totalTokens);
  console.log();

  console.log('2. Direct tool usage - Generate speech with different voice...');
  const ctx = { agentId: 'demo', runId: 'demo-run' };
  const speech = await generateSpeech.execute(
    {
      text: 'This is a demonstration of text-to-speech using the Cogitator framework.',
      voice: 'marin',
      speed: 1.0,
      format: 'mp3',
    },
    ctx
  );
  console.log('Generated audio format:', speech.format);
  console.log('Voice used:', speech.voice);
  console.log('Text length:', speech.textLength, 'characters');

  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'demo-speech.mp3');
  fs.writeFileSync(outputPath, Buffer.from(speech.audioBase64, 'base64'));
  console.log('Audio saved to:', outputPath);
  console.log();

  console.log('3. Transcription example (using public audio)...');
  console.log('Note: For real usage, provide a valid audio URL');

  const demoTranscription = `
If you have an audio file URL, you can transcribe it like this:

  const result = await cog.run(audioAgent, {
    input: 'Please transcribe this audio and summarize the main points.',
    audio: ['https://example.com/your-audio.mp3'],
  });

Or use the tool directly:

  const transcription = await transcribeAudio.execute({
    audio: 'https://example.com/your-audio.mp3',
    language: 'en',
    timestamps: true,
  }, ctx);

  console.log(transcription.text);
  console.log(transcription.duration);
  console.log(transcription.words);  // word-level timestamps
`;
  console.log(demoTranscription);

  console.log('4. Available voices demonstration...');
  const voices = [
    { name: 'alloy', desc: 'Neutral, balanced' },
    { name: 'nova', desc: 'Bright, conversational' },
    { name: 'onyx', desc: 'Deep, authoritative' },
    { name: 'marin', desc: 'Natural, modern' },
  ] as const;

  for (const { name, desc } of voices) {
    console.log(`  Generating sample with voice: ${name} (${desc})`);
    const sample = await generateSpeech.execute(
      {
        text: `This is the ${name} voice.`,
        voice: name,
        format: 'mp3',
      },
      ctx
    );
    const samplePath = path.join(outputDir, `voice-${name}.mp3`);
    fs.writeFileSync(samplePath, Buffer.from(sample.audioBase64, 'base64'));
    console.log(`    Saved to: ${samplePath}`);
  }
  console.log();

  console.log('=== Done ===');
  console.log(`\nAll audio files saved to: ${outputDir}`);
}

main().catch(console.error);
