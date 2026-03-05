// AI Models Database
export const modelsDatabase = {
  text: {
    OpenAI: [
      { value: 'gpt4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt4o', label: 'GPT-4o' },
      { value: 'gpt4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt35-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'o1', label: 'o1 (Reasoning)' },
    ],
    Anthropic: [
      { value: 'claude-35-sonnet', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-opus', label: 'Claude 3 Opus' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    ],
    Google: [
      { value: 'gemini-20-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-pro', label: 'Gemini Pro' },
      { value: 'palm-2', label: 'PaLM 2' },
    ],
    Meta: [
      { value: 'llama-31-405b', label: 'Llama 3.1 405B' },
      { value: 'llama-31-70b', label: 'Llama 3.1 70B' },
      { value: 'llama-3-70b', label: 'Llama 3 70B' },
    ],
    Mistral: [
      { value: 'mistral-large', label: 'Mistral Large' },
      { value: 'mistral-medium', label: 'Mistral Medium' },
      { value: 'mistral-small', label: 'Mistral Small (7B)' },
    ],
    xAI: [
      { value: 'grok-3', label: 'Grok 3' },
      { value: 'grok-2', label: 'Grok 2' },
    ],
    Cohere: [
      { value: 'command-r-plus', label: 'Command R+' },
      { value: 'command-r', label: 'Command R' },
    ],
  },
  image: {
    OpenAI: [
      { value: 'dalle3', label: 'DALL-E 3' },
      { value: 'dalle2', label: 'DALL-E 2' },
    ],
    'Stability AI': [
      { value: 'sdxl', label: 'Stable Diffusion XL 1.0' },
      { value: 'sd3', label: 'Stable Diffusion 3' },
      { value: 'sd3-turbo', label: 'Stable Diffusion 3 Turbo' },
    ],
    Midjourney: [
      { value: 'mj-v6', label: 'Midjourney v6' },
      { value: 'mj-v5.2', label: 'Midjourney v5.2' },
    ],
    Google: [
      { value: 'imagen-3', label: 'Imagen 3' },
      { value: 'imagen-2', label: 'Imagen 2' },
    ],
    Adobe: [{ value: 'firefly-v3', label: 'Firefly v3' }],
  },
  video: {
    OpenAI: [{ value: 'sora', label: 'Sora' }],
    Google: [
      { value: 'gemini-video', label: 'Gemini Video' },
      { value: 'veo', label: 'Veo' },
    ],
    Runway: [
      { value: 'gen3-alpha', label: 'Gen-3 Alpha' },
      { value: 'gen2', label: 'Gen-2' },
    ],
    Pika: [{ value: 'pika-20', label: 'Pika 2.0' }],
  },
  audio: {
    OpenAI: [
      { value: 'whisper', label: 'Whisper (Speech-to-Text)' },
      { value: 'tts-1', label: 'TTS-1 (Text-to-Speech)' },
      { value: 'tts-1-hd', label: 'TTS-1 HD' },
    ],
    Google: [
      { value: 'google-stt', label: 'Speech-to-Text' },
      { value: 'google-tts', label: 'Text-to-Speech' },
    ],
    ElevenLabs: [
      { value: 'eleven-v3', label: 'ElevenLabs v3' },
      { value: 'eleven-v2', label: 'ElevenLabs v2' },
    ],
  },
  code: {
    OpenAI: [
      { value: 'gpt4-code', label: 'GPT-4 Turbo' },
      { value: 'gpt4o-code', label: 'GPT-4o' },
    ],
    Anthropic: [
      { value: 'claude-code', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-opus-code', label: 'Claude 3 Opus' },
    ],
    Meta: [
      { value: 'codellama-34b', label: 'Code Llama 34B' },
      { value: 'codellama-13b', label: 'Code Llama 13B' },
    ],
  },
};
