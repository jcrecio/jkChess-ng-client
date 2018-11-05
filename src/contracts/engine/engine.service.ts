import { Observable } from 'rxjs';

export interface IEngineService {
    doMove(gameId: string, move: any): Observable<any>;
    getBestMove(gameId: string): Observable<any>;
}
