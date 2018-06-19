const ZooKeeper = require ("zookeeper");
const Promise = require("bluebird");
const cfg = require("./cfg.json");

class ZK {
    constructor() {}

    init() {
        return new Promise((resolve, reject) => {
            try {
                this.zk = new ZooKeeper();
                this.zk.init({
                    connect: cfg.host,
                    timeout: cfg.timeout,
                    debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
                    host_order_deterministic: cfg.host_order_deterministic,

                });
            }catch(err) {
                return reject(err);
            }
            return resolve();
        });
    }

    conn() {
        return new Promise((resolve, reject) => {
            return this.zk.connect((err) => {
                if(err) {
                    return reject(err);
                }
                return resolve();
            })
        });
    }

    close() {
        process.nextTick(function () {
            this.zk.close ();
        });
    }

    /**
     * @param val {path: String, data: String, type: zk_type} type [ZOO_EPHEMERAL,ZOO_SEQUENCE]默认是永久节点
     *
     */
    createNode(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_create(val.path, val.data, val.zk_type, (rc, error, path) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve(path);
                    default:
                        return reject(rc);
                }
            });
        });
    }

    /**
     *
     * @param val {path: String, watch: boolean}
     */
    existed(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_exists(val.path, val.watch, (rc, error, stat) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve(stat);
                    default:
                        return reject(rc);
                }
            });
        });
    }

    existedWithWatcher(val) {
        return new Promise((resolve, reject) => {
            return this.zk.aw_exists(val.path,
                (type, state, path) => {
                    return resolve({
                        type: type,
                        state: state,
                        path: path
                    });
                },
                (rc, error, stat) => {
                    switch(rc) {
                        case ZooKeeper.ZOK:
                            return resolve(stat);
                        default:
                            return reject(rc);
                    }
            });
        });
    }

    /**
     *
     * @param val {path: String, watch: boolean}
     */
    getNodeInfo(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_get(val.path, val.watch, (rc, error, stat, data) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve({
                            stat: stat,
                            data: data
                        });
                    default:
                        return reject(rc);
                }
            });
        });
    }

    getNodeInfoWithWatcher(val) {
        return new Promise((resolve, reject) => {
            return this.zk.aw_get(val.path,
                (type, state, path) => {
                    return resolve({
                        type: type,
                        state: state,
                        path: path
                    });
                },
                (rc, error, stat, data) => {
                    switch(rc) {
                        case ZooKeeper.ZOK:
                            return resolve({
                                stat: stat,
                                data: data
                            });
                        default:
                            return reject(rc);
                    }
            });
        });
    }

    /**
     *
     * @param val {path: String, watch: boolean}
     */
    getChildrenInfo(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_get_children(val.path, val.watch, (rc, error, children) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve(children);
                    default:
                        return reject(rc);
                }
            });
        });
    }

    getChildrenInfoWithWatcher(val) {
        return new Promise((resolve, reject) => {
            return this.zk.aw_get_children(val.path,
                (type, state, path) => {
                    return resolve({
                        type: type,
                        state: state,
                        path: path
                    });
                },
                (rc, error, children) => {
                    switch(rc) {
                        case ZooKeeper.ZOK:
                            return resolve(children);
                        default:
                            return reject(rc);
                    }
                });
        });
    }

    /**
     *
     * @param val {path: String, watch: boolean}
     */
    getChildrenInfoWithStat(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_get_children2(val.path, val.watch, (rc, error, children, stat) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve({
                            children: children,
                            stat: stat
                        });
                    default:
                        return reject(rc);
                }
            });
        });
    }

    getChildrenInfoWithStatAndWatcher(val) {
        return new Promise((resolve, reject) => {
            return this.zk.aw_get_children2(val.path,
                (type, state, path) => {
                    return resolve({
                        type: type,
                        state: state,
                        path: path
                    });
                },
                (rc, error, children, stat) => {
                    switch(rc) {
                        case ZooKeeper.ZOK:
                            return resolve({
                                children: children,
                                stat: stat
                            });
                        default:
                            return reject(rc);
                    }
                });
        });
    }

    setNodeInfo(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_set(val.path, val.data, -1, (rc, error, stat) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve(stat);
                    default:
                        return reject(rc);
                }
            });
        });
    }

    deleteNode(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_delete_(val.path, -1, (rc, error) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve(rc);
                    default:
                        return reject(rc);
                }
            });
        });
    }

    setNodeAcl(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_set_acl(val.path, -1, val.acl, (rc, error) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve(rc);
                    default:
                        return reject(rc);
                }
            });
        });
    }

    getNodeAcl(val) {
        return new Promise((resolve, reject) => {
            return this.zk.a_get_acl(val.path, (rc, error, acl, stat) => {
                switch(rc) {
                    case ZooKeeper.ZOK:
                        return resolve({acl: acl, stat: stat});
                    default:
                        return reject(rc);
                }
            });
        });
    }
}


module.exports = new ZK();