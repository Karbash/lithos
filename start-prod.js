const { spawn } = require('child_process');

console.log('🚀 Iniciando Lithos Produção (Frontend + Backend)...');

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

  // Iniciar JSON Server em background (porta 3001)
  console.log('🔧 Iniciando JSON Server na porta 3001...');
  const jsonServer = spawn('npx', ['json-server', '--watch', 'db.json', '--port', '3001', '--host', '127.0.0.1'], {
    stdio: 'pipe',
    shell: true
  });

  // Aguardar JSON Server iniciar
  setTimeout(() => {
    console.log('🌐 Iniciando HTTP Server com proxy...');
    const port = process.env.PORT || 10000;

    // Usar http-server com configuração de proxy
    const httpServer = spawn('npx', ['http-server', 'dist/lithos/browser', '-c', 'http-server-config.json', '-p', port], {
      stdio: 'inherit',
      shell: true
    });

    console.log(`✅ Servidor rodando na porta ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔌 API: http://localhost:${port}/api`);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Encerrando servidores...');
      jsonServer.kill();
      httpServer.kill();
      process.exit(0);
    });

  }, 2000);
});