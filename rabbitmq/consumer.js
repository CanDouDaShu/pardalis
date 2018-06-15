'use strict';
const env = process.env.NODE_ENV || 'development';
const config = require('../cfg/' + env + '.js')().amqp;
const code = require('../cfg/server_state_code')();
const exitUtil = require('../util/exit');
const amqp = require('amqplib');
const mq_element = require('./config.json');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;


class mq_consumer extends EventEmitter {
    constructor() {
        super();
    }

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
                    case "channel":
                        return this.init_channel();
                }
            }, config.retryTime);
        });
    }

    init_channel() {
        return this.connection.createChannel()
            .then(channel => {
                this.channel = channel;
                this.setup_listeners();
                return Promise.resolve();
            }).catch(err => {
                console.log(err);
                this.channel.removeAllListeners();
                this.reconnect("channel");
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

    setup_topology() {
        return Promise.each(mq_element.consumer.queue, (q) => {
            return this.channel.assertQueue(q)
                .then(ret => {
                    console.log('assertQueue ', ret);
                    return Promise.resolve();
                }).catch(err => {
                    console.log(err);
                    throw new Error(err);
                })
        }).then(() => {
            return Promise.resolve();
        }).catch(err => {
            console.log(err);
            return Promise.reject(err);
        });
    }

    consume_msg(queue) {
        return this.channel.consume(queue, (msg) => {
            if(msg) {
                console.log("consumer receive msg from pub : " + msg.content.toString());
                this.emit(queue, msg.content.toString());
                this.channel.ack(msg);
            }
        })
    }

    listener(queue) {
        this.on(queue, (msg) => {
            return Promise.resolve(msg);
        });
    }
}

module.exports = new mq_consumer();