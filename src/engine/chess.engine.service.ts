import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { IEngineService } from '../contracts/engine/engine.service';
import { GameOption } from '../contracts/model/game.option';

@Injectable({
    providedIn: 'root',
})
export class ChessEngineService {
    constructor(private http: HttpClient) {

    }

    public doMove(gameId: string, move: any): Observable<any> {
        return this.http.post(`${this.formatGameUri(gameId)}/move`, { move: move });
    }

    public getBestMove(gameId: string): Observable<any> {
        return this.http.post(`${this.formatGameUri(gameId)}/moves/best`, {});
    }

    private formatGameUri(gameId: string): string {
        return `${environment.configuration.engineUri}/game/${gameId}/board`;
    }

    public getGame(gameId: string): Observable<any> {
        return this.http.get(`${this.formatGameUri(gameId)}/fen`);
    }

    public getGames(): Observable<any> {
        return this.http.get(`${environment.configuration.engineUri}/games`);
    }

    public undoMove(gameId): Observable<any> {
        return this.http.post(`${this.formatGameUri(gameId)}/undo`, {});
    }
}
