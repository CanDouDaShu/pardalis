'use strict'
const ZK = require('./init');
const Zookeeper = require('zookeeper');
const EventEmitter = require('events');
const _ = require('lodash');

class DistributedLockClient extends EventEmitter {
    constructor() {
        super();
        this.node = null;
    }

    init() {
        return ZK.init()
            .then(() => {
                ZK.conn()
                    .then(() => {
                        return Promise.resolve();
                    }).catch((err) => {
                    throw new Error(err);
                });
            }).catch((err) => {
            throw new Error(err);
        });
    }

    applyLockNode() {
        return this.init()
            .then(() => {
                ZK.createNode({
                    path: '/5th/lock/node_',
                    data: '',
                    zk_type: Zookeeper.ZOO_EPHEMERAL | Zookeeper.ZOO_SEQUENCE
                }).then((path) => {
                    this.node = path;
                })
                    .catch((err) => {
                        throw new Error(err);
                    });
            })
            .catch((err) => {throw new Error(err);});
    }

    getChildren() {
        return ZK.getChildrenInfo({
            path: '/5th/lock',
            watch: false
        })
    }

    sort() {
        return this.getChildren()
            .then((rets) => {
                return Promise.resolve(_.orderBy(rets));
            });
    }

    releaseLock(path) {
        return ZK.deleteNode({path: path})
    }

    judgeIfGetLock() {
        return this.sort()
            .then((rets) => {
                if(this.node.split('lock/')[1] === rets[0]) {
                    // 获得分布式锁

                    // 释放锁
                    setTimeout(() => {
                        return this.releaseLock(this.node);
                    }, 1000);
                    return Promise.resolve();
                }
                // 只监听上一个node的变化情况 防止羊群效应
                let lastNode = rets[_.sortedIndexOf(rets,this.node.split('lock/')[1]) - 1];
                return this.listener(this.node.split('lock/')[0]+lastNode);
            });
    }

    listener(path) {
        DistributedLockClient.call(this,ZK);
        return this.zk.aw_exists(path,
            (type, state, path) => {
                // 监听到了node变化
                return this.judgeIfGetLock();
            },
            (rc, error, stat) => {
                switch(rc) {
                    case 0:
                        return Promise.resolve(stat);
                    default:
                        return Promise.reject(rc);
                }
            });

    }
}




module.exports = DistributedLockClient;