import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

// Lazy-init: creates the client on first use instead of at module load time.
// This avoids crashing the Vercel build when env vars aren't set yet during
// the "collecting page data" step (build-time), while still failing loudly
// at runtime if the vars are genuinely missing.
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing Supabase env vars — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export interface FournityContent {
  id: string;
  chapter_number: number;
  chapter_title: string;
  content_type: string;
  scripture_ref: string | null;
  text: string;
}

export async function getNextContent(): Promise<FournityContent> {
  const { data, error } = await getSupabase()
    .from('fournity_content')
    .select('*')
    .order('used_count', { ascending: true })
    .order('last_used_at', { ascending: true, nullsFirst: true })
    .limit(1)
    .single();

  if (error || !data) throw new Error(`No content available: ${error?.message}`);
  return data;
}

export async function createPendingPost(contentId: string): Promise<string> {
  const { data, error } = await getSupabase()
    .from('daily_posts')
    .insert({ fournity_content_id: contentId, platform_status: 'pending' })
    .select('id')
    .single();

  if (error || !data) throw new Error(`Failed to create post row: ${error?.message}`);
  return data.id;
}

export async function generateScriptAndCaption(content: FournityContent) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            "You write short spoken-word scripts and Instagram captions for FOURNITY, a faith-based book on humanity's union with the Trinity. Voice: Rev Mokoro Manana — direct, faith-grounded, confrontational but loving, township-rooted. Never generic. Output strict JSON only: {\"voiceover_script\": \"...\", \"caption_text\": \"...\"}. voiceover_script: 90-second spoken read (roughly 200-230 words), written to be heard, not read. caption_text: Instagram caption ending with this exact CTA block: 'Read FOURNITY free at fournity.co.za — pay only when you\\'re blessed. Link in bio.' Never use 'make money', 'earn income', or 'join my team'.",
        },
        {
          role: 'user',
          content: `Chapter ${content.chapter_number}: ${content.chapter_title}\nType: ${content.content_type}\nScripture: ${content.scripture_ref ?? 'n/a'}\nText: ${content.text}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const parsed = JSON.parse(json.choices[0].message.content);
  return parsed as { voiceover_script: string; caption_text: string };
}

export async function generateVoice(script: string): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID!;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text: script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) throw new Error(`ElevenLabs error: ${res.status} ${await res.text()}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function uploadAudio(postId: string, audio: Buffer): Promise<string> {
  const path = `${postId}.mp3`;
  const { error } = await getSupabase().storage.from('daily-audio').upload(path, audio, {
    contentType: 'audio/mpeg',
    upsert: true,
  });
  if (error) throw new Error(`Audio upload failed: ${error.message}`);

  const { data } = getSupabase().storage.from('daily-audio').getPublicUrl(path);
  return data.publicUrl;
}

// Renders the video using a Creatomate template you design once in their editor.
// The template should already contain: the background/motion style, the persistent
// "fournity.co.za" footer, and the enlarging closing card. This function only feeds
// it the day's audio — Creatomate auto-transcribes the voiceover into synced on-screen
// captions if your template's audio element is referenced by the caption element.
//
// Rendering is asynchronous: POST starts the render, then we poll until it's done.
export async function generateVideo(audioUrl: string): Promise<string> {
  const templateId = process.env.CREATOMATE_TEMPLATE_ID!;

  const startRes = await fetch('https://api.creatomate.com/v2/renders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
    },
    body: JSON.stringify({
      template_id: templateId,
      modifications: {
        // "Voiceover" must match the name of the audio element inside your
        // Creatomate template. Rename this key if you named it differently.
        'Voiceover.source': audioUrl,
      },
    }),
  });

  if (!startRes.ok) throw new Error(`Creatomate render start failed: ${startRes.status} ${await startRes.text()}`);
  const started = await startRes.json();
  const renderId = started[0]?.id;
  if (!renderId) throw new Error('Creatomate did not return a render id');

  // Poll until the render finishes — typically 30-90s for a 90-second video.
  const MAX_ATTEMPTS = 30;
  const POLL_INTERVAL_MS = 5000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const statusRes = await fetch(`https://api.creatomate.com/v2/renders/${renderId}`, {
      headers: { Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}` },
    });
    if (!statusRes.ok) throw new Error(`Creatomate status check failed: ${statusRes.status} ${await statusRes.text()}`);

    const status = await statusRes.json();
    if (status.status === 'succeeded') return status.url as string;
    if (status.status === 'failed') throw new Error(`Creatomate render failed: ${JSON.stringify(status)}`);
    // otherwise still "planned" or "processing" — keep polling
  }

  throw new Error('Creatomate render timed out after 2.5 minutes');
}

export async function publishToBuffer(videoUrl: string, caption: string): Promise<string> {
  const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.BUFFER_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      profile_ids: [process.env.BUFFER_INSTAGRAM_PROFILE_ID],
      text: caption,
      media: { video: videoUrl },
      now: true,
    }),
  });

  if (!res.ok) throw new Error(`Buffer error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.updates?.[0]?.id ?? '';
}

export async function markPostResult(
  postId: string,
  result:
    | { status: 'posted'; voiceover_script: string; caption_text: string; audio_url: string; video_url: string; buffer_post_id: string }
    | { status: 'failed'; error: string }
) {
  if (result.status === 'posted') {
    await getSupabase()
      .from('daily_posts')
      .update({
        platform_status: 'posted',
        posted_at: new Date().toISOString(),
        voiceover_script: result.voiceover_script,
        caption_text: result.caption_text,
        audio_url: result.audio_url,
        video_url: result.video_url,
        buffer_post_id: result.buffer_post_id,
      })
      .eq('id', postId);
  } else {
    await getSupabase()
      .from('daily_posts')
      .update({ platform_status: 'failed', error_log: result.error })
      .eq('id', postId);
  }
}

export async function markContentUsed(contentId: string) {
  const { data } = await getSupabase()
    .from('fournity_content')
    .select('used_count')
    .eq('id', contentId)
    .single();

  await getSupabase()
    .from('fournity_content')
    .update({ used_count: (data?.used_count ?? 0) + 1, last_used_at: new Date().toISOString() })
    .eq('id', contentId);
}
