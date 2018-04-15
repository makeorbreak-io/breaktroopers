"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Statistics = /** @class */ (function () {
    function Statistics() {
        this.stats = {};
    }
    Statistics.prototype.addGame = function (game) {
        var answers = game.getAnswers();
        for (var _i = 0, answers_1 = answers; _i < answers_1.length; _i++) {
            var answer = answers_1[_i];
            var isWinner = game.getWinner() === answer.userId;
            var productPrice = game.getProduct().price;
            this.addStat(answer, isWinner, productPrice);
        }
    };
    Statistics.prototype.addStat = function (answer, won, productPrice) {
        var baseStat = {
            gamesWon: 0,
            gamesPlayed: 0,
            exactPriceMatches: 0
        };
        var curStat = this.stats[answer.userId] || baseStat;
        if (productPrice === answer.price) {
            curStat.exactPriceMatches++;
        }
        if (won) {
            curStat.gamesWon++;
        }
        curStat.gamesPlayed++;
        this.stats[answer.userId] = curStat;
    };
    Statistics.prototype.getUserStats = function (userId) {
        return this.stats[userId];
    };
    return Statistics;
}());
exports.default = Statistics;
