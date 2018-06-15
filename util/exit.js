var events = [
    { name: "beforeExit", exitCode: 0 },
    { name: "exit", exitCode: 0 },
    { name: "uncaughtExecption", exitCode: 1 },
    { name: "SIGINT", exitCode: 130 },
    { name: "SIGTERM", exitCode: 143 }
];
module.exports = {
    ifExit(fn){
        events.forEach(e => {
            process.on(e.name, () => {
                fn()
                process.exit(e.exitCode);
            });
        });
    }
}