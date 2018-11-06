import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChessEngineService } from '../engine/chess.engine.service';

declare var $: any;
declare var ChessBoard: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
@Injectable()
export class AppComponent implements OnInit {
  title = 'ngGlobalChess';

  gameId: string;
  board: any;
  config: any;
  pendingMove: string;

  constructor(private http: HttpClient, private engineService: ChessEngineService) {
    this.config = this.getBoardConfig('start');
  }

  ngOnInit() {
    this.board = ChessBoard('board', this.config);
  }

  onDropHandler(source, target, piece, newPos, oldPos, orientation) {
    const move = `${source}${target}`;
    this.moveRockIfCastle(move);

    return this.engineService.doMove(this.gameId, move)
      .toPromise()
      .then(response => this.engineService.getBestMove(this.gameId)
      .toPromise())
      .then((responseMove: any) => {
        const uciMove = responseMove.Move;
        this.moveCpu(this.formatUciMoveToUiMove(uciMove));

        return uciMove;
      });
  }

  moveRockIfCastle(moveCoordinates) {
    if (moveCoordinates === 'e1g1') {
      this.board.move('h1-f1');
    } else if (moveCoordinates === 'e1c1') {
      this.board.move('a1-d1');
    } else if (moveCoordinates === 'e8g8') {
      this.board.move('h8-f8');
    } else if (moveCoordinates === 'e8a8') {
      this.board.move('a8-d8');
    }
  }

  moveCpu(moveCoordinates) {
    if (moveCoordinates === 'e1-g1') {
      this.board.move('e1-g1');
      this.board.move('h1-f1');
    } else if (moveCoordinates === 'e1-a1') {
      this.board.move('e1-c1');
      this.board.move('a1-d1');
    } else if (moveCoordinates === 'e8-g8') {
      this.board.move('e8-g8');
      this.board.move('h8-f8');
    } else if (moveCoordinates === 'e8-a8') {
      this.board.move('e8-c8');
      this.board.move('a8-d8');
    } else {
      this.board.move(moveCoordinates);
    }
  }

  private formatUciMoveToUiMove(uciMove: any): any {
    return `${uciMove.substring(0, 2)}-${uciMove.substring(2, 4)}`;
  }

  setGame() {
    return this.engineService.getGame(this.gameId)
      .toPromise().then(response => this.setBoardPosition(response.Board));
  }

  private setBoardPosition(fenBoard: string) {
    this.board = ChessBoard('board', this.getBoardConfig(fenBoard));
  }

  private getBoardConfig(position) {
    return {
      draggable: true,
      position: position,

      onDrop: (source, target, piece, newPos, oldPos, orientation) =>
        this.onDropHandler(source, target, piece, newPos, oldPos, orientation),
    };
  }
}
