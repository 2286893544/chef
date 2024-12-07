module.exports = {
  apps: [
    {
      name: 'webserve',  // 应用名称
      script: './bin/www', // 启动脚本路径
      instances: 'max',   // 自动根据 CPU 核数创建实例
      exec_mode: 'cluster',  // 使用集群模式，适用于多核 CPU 环境
      watch: false,        // 禁止文件监控，减少资源消耗
      max_memory_restart: '1G', // 如果应用占用内存超过 1GB，则自动重启
      env: {
        NODE_ENV: 'development',  // 开发环境配置
        PORT: 6624,               // 开发环境端口
      },
      env_production: {
        NODE_ENV: 'production',  // 生产环境配置
        PORT: 6624,              // 生产环境端口
      },
      log_file: './logs/app.log',  // 正常日志输出文件
      error_file: './logs/app-error.log', // 错误日志输出文件
      out_file: './logs/app-output.log',  // 正常输出日志文件
      combine_logs: true, // 合并日志文件
      cron_restart: '0 0 * * *',  // 定时任务重启（例如每天午夜重启）
    },
  ],
};
