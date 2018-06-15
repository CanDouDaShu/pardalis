'use strict';
const env = process.env.NODE_ENV || 'development';
const config = require('../cfg/' + env + '.js')().amqp;
const code = require('../cfg/server_state_code')();
const exitUtil = require('../util/exit');
const amqp = require('amqplib');
const mq_element = require('./config.json');
const Promise = require('bluebird');


class mq_publish {
    constructor() {}

    init_connect() {
        return amqp.connect(config)
            .then(connection => {
                this.connection = connection;
                return Promise.resolve();
            }).catch(err => {
                console.log(err);
                return this.reconnect("connection");
            });
    }

    reconnect(type) {
        return new Promise(() => {
            setTimeout(() => {
                switch(type) {
                    case "connection":
                        return this.init_connect();
                    case "confirm_channel":
                        return this.init_channel_with_transaction();
                }
            }, config.retryTime);
        });
    }

    init_channel_with_transaction() {
        return this.connection.createConfirmChannel()
            .then(channel => {
                this.channel = channel;
                this.setup_listeners();
                return Promise.resolve();
            }).catch(err => {
                console.log(err);
                this.channel.removeAllListeners();
                this.reconnect("confirm_channel");
            });
    }

    setup_listeners() {
        this.channel.once('error', err => {
            console.log('err', err);
            this.reconnect("confirm_channel");
        });
        this.channel.once('close', () => {
            this.reconnect("confirm_channel");
        });
        exitUtil.ifExit(() => {
            console.log('exit pub mq');
            this.connection.close();
        });
    }

    close(type) {
        switch(type) {
            case "connection":
                return this.connection.close()
                    .then(() => {
                        return Promise.resolve();
                    })
                    .catch(err => {
                        console.log(err);
                        return Promise.reject();
                    });
            case "channel":
                return this.channel.close()
                    .then(() => {
                        return Promise.resolve();
                    })
                    .catch(err => {
                        console.log(err);
                        return Promise.reject();
                    });
        }
    }

    setup_topology(exchange_type) {
        return Promise.each(mq_element.publish[exchange_type],(ex) => {
            return this.channel.assertExchange(ex.exchange, exchange_type)
                .then(() => {
                    console.log('assertExchange '+ex.exchange+' success');
                    return Promise.each(ex.mapping, (q) => {
                        return this.channel.assertQueue(q.queue)
                            .then(() => {
                                return this.channel.bindQueue(q.queue, ex.exchange, q.routingKey)
                                    .then(() => {
                                        console.log('bindQueue ' + q.queue + ' success');
                                        return Promise.resolve();
                                    }).catch(err => {
                                        console.log(err);
                                        throw new Error(err);
                                    });
                            }).catch(err => {
                                console.log(err);
                                throw new Error(err);
                            });
                    }).then(() => {
                        console.log("all queue bind success");
                        return Promise.resolve();
                    }).catch(err => {
                        console.log(err);
                        throw new Error(err);
                    });
                }).catch(err => {
                    console.log(err);
                    throw new Error(err);
                });
        }).then(() => {
            console.log("all exchange assert success");
            return Promise.resolve();
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    send_msg(exchange, routingKey, json) {
        return new Promise((resolve, reject) => {
            return this.channel.publish(exchange, routingKey, new Buffer(JSON.stringify(json)), {}, err => {
                if (!err) {
                    return resolve(code.CODE.MQ_PUBLISH_SUCCESS);
                }
                return reject(code.CODE.MQ_PUBLISH_FAILED);
            });
        });
    }

    transaction() {
        return this.channel.waitForConfirms()
            .then(() => {
                return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err);
            });
    }
}

module.exports = new mq_publish();