"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_lock_1 = __importDefault(require("async-lock"));
class Lock {
    constructor() {
        this.lock = new async_lock_1.default();
    }
    getKey() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.key) {
                yield Lock.genLock.acquire('__lock_gen_', () => {
                    this.key = `__lock_${Lock.index++}_`;
                });
            }
            return this.key;
        });
    }
    run(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lock.acquire(yield this.getKey(), () => __awaiter(this, void 0, void 0, function* () {
                let r = fn();
                if (r instanceof Promise) {
                    yield r;
                }
            }));
        });
    }
}
Lock.index = 0;
Lock.genLock = new async_lock_1.default();
exports.default = Lock;
