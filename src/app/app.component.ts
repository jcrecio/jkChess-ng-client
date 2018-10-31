import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare var $: any;
declare var ChessBoard: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
@Injectable()
export class AppComponent implements OnInit {
  game: string;
  title = 'ngGlobalChess';
  board: any;
  cfg: any;
  pendingMove: string;

  constructor(private http: HttpClient) {
    this.cfg = {
      draggable: true,
      onDrop: (source, target, piece, newPos, oldPos, orientation) =>
        this.onDropHandler(source, target, piece, newPos, oldPos, orientation),
      position: 'start'
    };
  }

  onDropHandler(source, target, piece, newPos, oldPos, orientation) {
    const move = `${source}${target}`;
    this.moveRockIfCastle(move);

    return this.http.post(`http://127.0.0.1:5000/game/${this.game}/board/move`, { move: move })
      .toPromise()
      .then(response => this.http.post(`http://127.0.0.1:5000/game/${this.game}/board/moves/best`, {})
        .toPromise())
      .then((responseMove: any) => {
        const uciMove = responseMove.Move;
        this.moveCpu(uciMove.substring(0, 2) + '-' + uciMove.substring(2, 4));

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

  ngOnInit() {
    this.board = ChessBoard('board', this.cfg);
  }
}
