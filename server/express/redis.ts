import { createClient } from 'redis';
import requireEnv from './src/utils/env.ts';

const redis = createClient({
    username: 'default',
    password: requireEnv("REDIS_PASS"),
    socket: {
        host: requireEnv("REDIS_HOST"),
        port: 15005
    }
});

export default redis