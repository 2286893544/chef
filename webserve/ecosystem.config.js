module.exports = {
  apps: [
    {
      name: 'webserve', // 应用名称
      script: './bin/www', // 启动脚本路径
      instances: 'max', // 根据 CPU 核心数启动实例
      exec_mode: 'cluster', // 集群模式
      watch: false, // 禁止文件变化监控
      max_memory_restart: '1G', // 内存限制，超过 1GB 自动重启
      restart_delay: 5000, // 重启延迟 5 秒
      max_restarts: 5, // 最大重启次数
      env: {
        NODE_ENV: 'development', // 开发环境
        PORT: 6624, // 开发环境端口
      },
      env_production: {
        NODE_ENV: 'production', // 生产环境
        PORT: 6624, // 生产环境端口
      },
      log_file: './logs/app.log', // 正常日志文件路径
      error_file: './logs/app-error.log', // 错误日志文件路径
      out_file: './logs/app-output.log', // 正常日志输出路径
      combine_logs: true, // 合并日志
      cron_restart: '0 0 * * *', // 定时任务，每天午夜重启
    },
  ],
};
