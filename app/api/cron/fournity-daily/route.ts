import { NextRequest, NextResponse } from 'next/server';
import {
  getNextContent,
  createPendingPost,
  generateScriptAndCaption,
  generateVoice,
  uploadAudio,
  generateVideo,
  publishToBuffer,
  markPostResult,
  markContentUsed,
} from '@/lib/fournity/pipeline';

// Protect this route so only Vercel Cron (or you, manually, with the secret) can trigger it.
function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let postId: string | undefined;
  let contentId: string | undefined;

  try {
    const content = await getNextContent();
    contentId = content.id;
    postId = await createPendingPost(content.id);

    const { voiceover_script, caption_text } = await generateScriptAndCaption(content);
    const audioBuffer = await generateVoice(voiceover_script);
    const audioUrl = await uploadAudio(postId, audioBuffer);
    const videoUrl = await generateVideo(audioUrl, voiceover_script);
    const bufferPostId = await publishToBuffer(videoUrl, caption_text);

    await markPostResult(postId, {
      status: 'posted',
      voiceover_script,
      caption_text,
      audio_url: audioUrl,
      video_url: videoUrl,
      buffer_post_id: bufferPostId,
    });
    await markContentUsed(content.id);

    return NextResponse.json({ success: true, postId, chapter: content.chapter_number });
  } catch (err: any) {
    if (postId) {
      await markPostResult(postId, { status: 'failed', error: err.message ?? String(err) });
    }
    console.error('Fournity daily pipeline failed:', err);
    return NextResponse.json({ success: false, error: err.message ?? String(err) }, { status: 500 });
  }
}
