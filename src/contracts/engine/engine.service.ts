import { Observable } from 'rxjs';
import { GameOption } from '../../contracts/model/game.option';

export interface IEngineService {
    doMove(gameId: string, move: any): Observable<any>;
    getBestMove(gameId: string): Observable<any>;
    getGame(gameId: string): Observable<any>;
    getGames(): Observable<any>;
    undoMove(gameId): Observable<any>;
}
