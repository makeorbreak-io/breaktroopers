"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var getRandomProductPage = require('./randomproduct');
var MAX_PLAYERS = 4;
var GAME_TIMEOUT = 60 * 1000; // in ms
var GameState;
(function (GameState) {
    GameState[GameState["STARTED"] = 0] = "STARTED";
    GameState[GameState["FINISHED"] = 1] = "FINISHED";
})(GameState || (GameState = {}));
exports.GameState = GameState;
var GameFinishStatus;
(function (GameFinishStatus) {
    GameFinishStatus[GameFinishStatus["WINNER"] = 0] = "WINNER";
    GameFinishStatus[GameFinishStatus["DRAW"] = 1] = "DRAW";
    GameFinishStatus[GameFinishStatus["NOT_ENOUGH_PLAYERS"] = 2] = "NOT_ENOUGH_PLAYERS";
})(GameFinishStatus || (GameFinishStatus = {}));
var Game = /** @class */ (function () {
    function Game(channelId, onGameFinished, stats) {
        this.stats = stats;
        this.channelId = channelId;
        this.onGameFinished = onGameFinished;
        this.answers = {};
        this.state = GameState.STARTED;
        this.startGame();
    }
    Game.prototype.startGame = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, getRandomProductPage.getRandomProductPage()];
                    case 1:
                        _a.product = _b.sent();
                        setTimeout(this.finish, GAME_TIMEOUT);
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.numAnswers = function () {
        return Object.keys(this.answers).length;
    };
    Game.prototype.answer = function (userId, price) {
        // If the price is unique, then consider the answer. Otherwise, discard it.
        if (this.answers.filter(function (answer) { return answer.price === price; }).length === 0) {
            this.answers[userId] = {
                price: price,
                userId: userId
            };
        }
        if (this.numAnswers() > MAX_PLAYERS) {
            this.finish();
        }
    };
    Game.prototype.getProduct = function () {
        return this.product;
    };
    Game.prototype.getState = function () {
        return this.state;
    };
    Game.prototype.finish = function () {
        var _this = this;
        if (this.state === GameState.FINISHED) {
            return;
        }
        if (this.numAnswers() < 2) {
            this.onGameFinished(this.channelId, GameFinishStatus.NOT_ENOUGH_PLAYERS, this.winner, this.product.price);
            return;
        }
        var answersBelowPrice = this.answers.filter(function (answer) { return answer.price < _this.product.price; });
        var noAnswer = { price: 0 };
        var bestAnswer = answersBelowPrice.entries().reduce(function (prev, curr) { return prev.price > curr.price ? prev : curr; }, noAnswer);
        var gameFinishStatus = GameFinishStatus.DRAW;
        if (bestAnswer !== noAnswer) {
            this.winner = bestAnswer.userId;
            gameFinishStatus = GameFinishStatus.WINNER;
        }
        this.state = GameState.FINISHED;
        this.onGameFinished(this.channelId, gameFinishStatus, this.winner, this.product.price);
        this.stats.addGame(this);
    };
    Game.prototype.getWinner = function () {
        return this.winner;
    };
    Game.prototype.getAnswers = function () {
        return this.answers;
    };
    return Game;
}());
exports.Game = Game;
