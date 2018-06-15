const ZooKeeper = require ("zookeeper");
const Promise = require("bluebird");
const cfg = require("./cfg.json");

class ZK {
    constructor() {}

    init() {
        return new Promise((resolve, reject) => {
            try {
                this.zk = new ZooKeeper({
                    connect: cfg.host,
                    timeout: cfg.timeout,
                    debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
                    host_order_deterministic: cfg.host_order_deterministic
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
                if(rc == ZooKeeper.ZNODEEXISTS) {
                    return resolve(ZooKeeper.ZNODEEXISTS);
                }
                if(rc != ZooKeeper.ZOK) {
                    return reject(rc);
                }
                return resolve(path);
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
                if(rc == ZooKeeper.ZNONODE) {
                    return reject(rc);
                }
                if(rc == ZooKeeper.ZOK) {
                    return resolve(stat);
                }
            });
        });
    }

    getNodeInfo() {}

}


module.exports = new ZK();