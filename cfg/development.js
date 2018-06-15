'use strict';

module.exports = () => {
    const config = {};
    config.sequelize = {
        username: 'root',
        password: '',
        database: 'argus',
        host: '127.0.0.1',
        port: 3306,
        dialect: 'mysql',
        pool: {
            max: 10,
            min: 1,
            idle: 100,
        },
    };
    config.amqp = {
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        retryTime: 10000,
    };
    config.dynamodb = {
        region: "ap-northeast-1",
        endpoint: "http://localhost:8000"
    };
    config.redis = {
        endpoint: "http://localhost:6379"
    };
    return config;
};
