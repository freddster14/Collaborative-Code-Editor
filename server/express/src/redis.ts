import { createClient } from 'redis';
import requireEnv from './utils/env.js';

const redis = createClient({
    username: 'default',
    password: requireEnv("REDIS_PASS"),
    socket: {
        host: requireEnv("REDIS_HOST"),
        port: Number(requireEnv("REDIS_PORT"))
    }
});

export default redis