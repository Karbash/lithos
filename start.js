const { spawn } = require('child_process');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚀 Iniciando Lithos (Frontend + Backend)...');

// Primeiro, fazer o build de produção
console.log('📦 Fazendo build de produção...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build falhou');
    process.exit(1);
  }

  console.log('✅ Build concluído!');

  // Iniciar JSON Server em background
  console.log('🔧 Iniciando JSON Server...');
  const jsonServer = spawn('npx', ['json-server', '--watch', 'db.json', '--port', '3001', '--host', '127.0.0.1'], {
    stdio: 'pipe',
    shell: true
  });

  // Aguardar um pouco para o JSON Server iniciar
  setTimeout(() => {
    console.log('🌐 Configurando servidor Express com proxy...');

    const app = express();
    const PORT = process.env.PORT || 10000;

    // Proxy para API - redireciona /api/* para JSON Server local
    app.use('/api', createProxyMiddleware({
      target: 'http://127.0.0.1:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '' // Remove /api do path
      }
    }));

    // Servir arquivos estáticos do Angular
    app.use(express.static('dist/lithos/browser'));

    // SPA fallback - qualquer rota não-API vai para index.html
    app.get('*', (req, res) => {
      res.sendFile('dist/lithos/browser/index.html', { root: '.' });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Lithos rodando em http://0.0.0.0:${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🔌 API: http://localhost:${PORT}/api`);
    });

  }, 2000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidores...');
    jsonServer.kill();
    process.exit(0);
  });

  jsonServer.on('close', () => {
    console.log('JSON Server encerrado');
    process.exit(0);
  });
});