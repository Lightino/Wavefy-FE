const PY_SERVICE_URL =
  process.env.WAVEFY_PY_URL || 'http://wavefy-be.158.220.124.125.sslip.io/convert';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio');

    if (!file || typeof file === 'string') {
      return new Response(
        JSON.stringify({ error: 'Nessun file audio ricevuto.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Preparo una nuova form-data da inoltrare al servizio Python
    const upstreamForm = new FormData();
    // file è un oggetto File (Web API), Node con fetch/undici lo gestisce
    upstreamForm.append('audio', file, file.name || 'audio.mp3');

    const upstreamRes = await fetch(PY_SERVICE_URL, {
      method: 'POST',
      body: upstreamForm
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => '');
      console.error('Errore dal servizio Python:', upstreamRes.status, text);
      return new Response(
        JSON.stringify({
          error: 'Errore dal servizio di conversione.',
          status: upstreamRes.status
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Prendo il contenuto MP4 e lo giro al client
    const blobArrayBuffer = await upstreamRes.arrayBuffer();

    // Cerco di preservare content-type e content-disposition se presenti
    const headers = new Headers();
    const ct = upstreamRes.headers.get('content-type') || 'video/mp4';
    const cd =
      upstreamRes.headers.get('content-disposition') ||
      'attachment; filename="waveform.mp4"';

    headers.set('Content-Type', ct);
    headers.set('Content-Disposition', cd);

    return new Response(blobArrayBuffer, {
      status: 200,
      headers
    });
  } catch (err) {
    console.error('Errore nella conversione (proxy):', err);
    return new Response(
      JSON.stringify({
        error: 'Errore interno durante la conversione.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
