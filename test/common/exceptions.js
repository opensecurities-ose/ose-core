const Log = require('../../utils/LogConsole');
const PREERR1 = "VM Exception while processing transaction: ";
const PREERR2 = "Returned error: VM Exception while processing transaction: ";

async function tryCatch(promise, message) {
    try {
        await promise;
        throw null;
    } catch (error) {
        Log.trace('tryCatch error:', error);
        assert(error, "Expected an error but did not get one");
        try {
            assert(
                error.message.startsWith(PREERR1 + message),
                "Expected an error starting with '" + PREERR1 + message + "' but got '" + error.message + "' instead"
            );
        } catch (error) {
            assert(
                error.message.startsWith(PREERR2 + message),
                "Expected an error starting with '" + PREERR1 + message + "' but got '" + error.message + "' instead"
            );
        }
    }
}

module.exports = {
    catchRevert: async function(promise) {
        await tryCatch(promise, "revert");
    },
    catchOutOfGas: async function(promise) {
        await tryCatch(promise, "out of gas");
    },
    catchInvalidJump: async function(promise) {
        await tryCatch(promise, "invalid JUMP");
    },
    catchInvalidOpcode: async function(promise) {
        await tryCatch(promise, "invalid opcode");
    },
    catchStackOverflow: async function(promise) {
        await tryCatch(promise, "stack overflow");
    },
    catchStackUnderflow: async function(promise) {
        await tryCatch(promise, "stack underflow");
    },
    catchStaticStateChange: async function(promise) {
        await tryCatch(promise, "static state change");
    }
};
