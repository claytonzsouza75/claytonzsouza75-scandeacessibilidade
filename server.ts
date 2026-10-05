import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { runAccessibilityAudit } from './server/analyzer.js';
import { safeFetchHtml } from './server/fetcher.js';
import { SAMPLE_SCENARIOS } from './server/samples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '5mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'ScandeAcessibilidade', version: '1.0.0' });
});

// Demo samples list
app.get('/api/samples', (_req: Request, res: Response) => {
  const list = Object.entries(SAMPLE_SCENARIOS).map(([id, s]) => ({
    id,
    title: s.title,
    url: s.url,
  }));
  res.json({ samples: list });
});

// Main Audit Endpoint
app.post('/api/audit', async (req: Request, res: Response) => {
  const { url, sampleId } = req.body || {};

  // Check if requesting a sample scenario
  if (sampleId && SAMPLE_SCENARIOS[sampleId]) {
    const sample = SAMPLE_SCENARIOS[sampleId];
    const startTime = Date.now();
    const report = runAccessibilityAudit({
      url: sample.url,
      html: sample.html,
      durationMs: 420 + Math.floor(Math.random() * 200),
    });
    report.pageTitle = sample.title;
    report.isSimulated = true;
    return res.json(report);
  }

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A URL do site é obrigatória.' });
  }

  // Check if matching sample URL
  for (const [key, s] of Object.entries(SAMPLE_SCENARIOS)) {
    if (url.trim().toLowerCase() === s.url.toLowerCase()) {
      const report = runAccessibilityAudit({
        url: s.url,
        html: s.html,
        durationMs: 380,
      });
      report.pageTitle = s.title;
      report.isSimulated = true;
      return res.json(report);
    }
  }

  // Safe fetch target website with SSRF protection
  const fetchResult = await safeFetchHtml(url);

  if (!fetchResult.ok || !fetchResult.html) {
    return res.status(422).json({
      error: fetchResult.error || 'Não foi possível acessar a página informada.',
      details: {
        statusCode: fetchResult.statusCode,
        durationMs: fetchResult.durationMs,
      },
    });
  }

  try {
    const report = runAccessibilityAudit({
      url: fetchResult.finalUrl || url,
      html: fetchResult.html,
      durationMs: fetchResult.durationMs,
    });
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({
      error: `Erro durante a análise do DOM da página: ${err.message || 'Falha inesperada'}`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScandeAcessibilidade] Server rodando em http://0.0.0.0:${PORT} (${isProd ? 'produção' : 'desenvolvimento'})`);
  });
}

startServer().catch(err => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
