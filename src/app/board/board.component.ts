import { Component, OnInit, Input } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IEngineService } from '../../contracts/engine/engine.service';
import { ChessEngineService } from '../../engine/chess.engine.service';

declare var $: any;
declare var ChessBoard: any;
declare var Math: any;

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.sass']
})
export class BoardComponent implements OnInit {

  @Input() gameId: string;
  board: any;
  orientation = 'white';
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

    return this.doMove(move)
      .then(_ => this.getBestMove())
      .then(cpuMove => this.displayCpuMove(cpuMove));
  }

  private doMove(move) {
    return this.engineService.doMove(this.gameId, move).toPromise();
  }

  private getBestMove() {
    return this.engineService.getBestMove(this.gameId).toPromise();
  }

  private displayCpuMove(cpuMove) {
    const cpuMoveUci = cpuMove.Move;
    this.moveCpu(this.formatUciMoveToUiMove(cpuMoveUci));

    return cpuMoveUci;
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
    } else if (moveCoordinates === 'e8-c8') {
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
    .toPromise()
    .then(response => this.setBoardPosition(response.Board));
  }

  private setBoardPosition(fenBoard: string) {
    this.board = ChessBoard('board', this.getBoardConfig(fenBoard));
  }

  private getBoardConfig(position) {
    return {
      draggable: true,
      position: position,
      orientation: this.orientation,
      onDrop: (source, target, piece, newPos, oldPos, orientation) =>
        this.onDropHandler(source, target, piece, newPos, oldPos, orientation),
    };
  }

  newGame() {
    this.gameId = Math.random().toString().replace('.', '');
    this.setGame();
  }
}