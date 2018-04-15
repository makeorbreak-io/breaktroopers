import {Game} from './logic'

export default class Statistics {
    private stats: any;

    constructor() {
        this.stats = {};
    }

    addGame(game: Game) {
        const answers: any = game.getAnswers();

        for (let answer of answers) {
            const isWinner = game.getWinner() === answer.userId;
            const productPrice = game.getProduct().price;

            this.addStat(answer, isWinner, productPrice);
        }
    }

    addStat(answer: any, won: boolean, productPrice: number) {
        const baseStat = {
            gamesWon: 0,
            gamesPlayed: 0,
            exactPriceMatches: 0
        };

        const curStat = this.stats[answer.userId] || baseStat;

        if (productPrice === answer.price) {
            curStat.exactPriceMatches++
        }

        if (won) {
            curStat.gamesWon++
        }

        curStat.gamesPlayed++;

        this.stats[answer.userId] = curStat
    }

    getUserStats(userId: string) {
        return this.stats[userId]
    }
}