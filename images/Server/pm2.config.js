const configPreset = {
  product: process.env.CONFIG_PRODUCT || 'main',
  env: process.env.CONFIG_ENV || 'dev',
  deploy: process.env.CONFIG_DEPLOY || 'local',
}

let node_args = []
if (process.env.CONFIG_DEBUGBRK) {
  node_args.push('--inspect-brk=0.0.0.0:8081')
} else if (process.env.CONFIG_DEBUG) {
  node_args.push('--inspect=0.0.0.0:8081')
} else if (configPreset.env === 'dev') {
  node_args.push('--inspect=0.0.0.0:8081')
}


module.exports = {
  apps: [
    {
      name: 'httpServer',
      script: './main.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      max_restarts: configPreset.env === 'dev' ? 3 : 10,
      kill_timeout: 10000,
      env: {
        NODE_ENV: { dev: 'development', prod: 'production' }[configPreset.env],
      },
      min_uptime: '10s',
      node_args,
    },
  ],
}
