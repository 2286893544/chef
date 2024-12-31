module.exports = {
  apps: [
    {
      name: 'webserve',                 // 应用名称
      script: './bin/www',              // 启动脚本路径
      instances: '1',                 // 根据 CPU 核数启动最大实例数
      exec_mode: 'cluster',             // 使用集群模式
      watch: false,                     // 禁用文件监控，减少资源消耗
      max_memory_restart: '1G',         // 内存超 1GB 时自动重启
      env: {
        NODE_ENV: 'development',        // 开发环境变量
        PORT: 6624,                     // 开发环境端口
      },
      env_production: {
        NODE_ENV: 'production',         // 生产环境变量
        PORT: 6624,                     // 生产环境端口
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',  // 日志中时间格式（更清晰）
      log_file: './logs/app.log',             // 全部日志文件路径
      error_file: './logs/app-error.log',     // 错误日志文件路径
      out_file: './logs/app-output.log',      // 输出日志文件路径
      combine_logs: true,              // 合并日志到单一文件
      cron_restart: '0 0 * * *',       // 每天午夜定时重启
    },
  ],
};