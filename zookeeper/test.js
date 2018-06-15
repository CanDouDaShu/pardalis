const ZK = require('./init');
const Zookeeper = require("zookeeper");
ZK.init()
    .then(() => {
        ZK.conn()
            .then(() => {
                let val = {};
                val.path = "/5th";
                val.data = "clj";
                val.zk_type = Zookeeper.ZOO_EPHEMERAL;
                ZK.createNode(val)
                    .then(() => {
                        ZK.existed({path: "/5th", watch: true});
                    }).catch(err => {
                        console.log("err : " +err);
                });
            });
    });
