module.exports = {
    apps: [
        {
            name: 'whatsapp-bridge',
            cwd: './whatsapp-bridge',
            script: 'node',
            args: 'index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 8001
            },
            restart_delay: 3000,
            max_restarts: 10
        },
        {
            name: 'backend-automation',
            cwd: './backend',
            script: 'uv',
            args: 'run src/main.py',
            interpreter: 'none',
            env: {
                PYTHONPATH: '.',
                PORT: 8000
            },
            restart_delay: 3000,
            max_restarts: 10
        }
    ]
};
