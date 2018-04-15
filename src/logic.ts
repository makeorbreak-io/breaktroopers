const getRandomProductPage = require('./randomproduct');
import Statistics from './statistics';

const MAX_PLAYERS = 4;
const GAME_TIMEOUT = 60 * 1000; // in ms

enum GameState {
    STARTED, FINISHED
}

enum GameFinishStatus {
    WINNER,
    DRAW,
    NOT_ENOUGH_PLAYERS
}

class Game {
    stats: Statistics;
    channelId: string;
    onGameFinished: Function;
    state: GameState;
    product: any;
    answers: any;
    winner: string;

    constructor(channelId: string, onGameFinished: Function, stats: Statistics) {
        this.stats = stats;
        this.channelId = channelId;
        this.onGameFinished = onGameFinished;
        this.answers = {};
        this.state = GameState.STARTED;
        this.startGame()
    }

    async startGame() {
        this.product = await getRandomProductPage.getRandomProductPage();
        setTimeout(this.finish, GAME_TIMEOUT)
    }

    numAnswers(): number {
        return Object.keys(this.answers).length
    }

    answer(userId: string, price: number): void {
        // If the price is unique, then consider the answer. Otherwise, discard it.
        if (this.answers.filter((answer: any) => answer.price === price).length === 0) {
            this.answers[userId] = {
                price,
                userId
            }
        }

        if (this.numAnswers() > MAX_PLAYERS) {
            this.finish()
        }
    }

    getProduct(): any {
        return this.product
    }

    getState(): GameState {
        return this.state
    }

    finish(): void {
        if (this.state === GameState.FINISHED) {
            return
        }

        if (this.numAnswers() < 2) {
            this.onGameFinished(this.channelId, GameFinishStatus.NOT_ENOUGH_PLAYERS, this.winner, this.product.price);
            return
        }

        let answersBelowPrice = this.answers.filter((answer: any) => answer.price < this.product.price);
        let noAnswer = {price: 0};

        let bestAnswer = answersBelowPrice.entries().reduce((prev: any, curr: any) => prev.price > curr.price ? prev : curr, noAnswer);

        let gameFinishStatus = GameFinishStatus.DRAW;

        if (bestAnswer !== noAnswer) {
            this.winner = bestAnswer.userId;
            gameFinishStatus = GameFinishStatus.WINNER;
        }

        this.state = GameState.FINISHED;

        this.onGameFinished(this.channelId, gameFinishStatus, this.winner, this.product.price);
        this.stats.addGame(this)
    }

    getWinner(): any {
        return this.winner
    }

    getAnswers(): any {
        return this.answers
    }
}

export {Game, GameState}
