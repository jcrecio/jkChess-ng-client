import {
  Component,
  OnInit,
  Input,
  DoCheck,
  KeyValueDiffers,
  KeyValueDiffer,
} from "@angular/core";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IEngineService } from "../../contracts/engine/engine.service";
import { ChessEngineService } from "../../engine/chess.engine.service";
import { GameOption } from "../../contracts/model/game.option";

declare var $: any;
declare var ChessBoard: any;
declare var Math: any;

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.sass"],
})
export class BoardComponent implements OnInit, DoCheck {
  @Input() gameId: string;

  gameLoaded: boolean;
  gameOptions: Array<GameOption>;

  board: any;
  orientation = "white";
  config: any;

  differ: KeyValueDiffer<string, any>;

  constructor(
    private differs: KeyValueDiffers,
    private chesEngineService: ChessEngineService
  ) {
    this.differ = this.differs.find({}).create();
  }

  ngOnInit() {
    this.setInitialBoardPosition();
    this.loadGames();

    this.gameId = undefined;
  }

  private setInitialBoardPosition() {
    this.config = this.getBoardConfig("start");
    this.setBoard();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (!changes.gameId.currentValue) {
  //     this.gameLoaded = false;
  //   }
  // }

  ngDoCheck() {
    const changes = this.differ.diff(this);
    if (!changes) return;

    changes.forEachChangedItem(change => {
      if (change.key === "gameId") {
        if (change.currentValue === undefined) {
          this.gameLoaded = false;
        }
        if (change.currentValue !== change.previousValue) {
          this.gameLoaded = false;
        }
      }
    });
  }

  setBoard() {
    this.board = ChessBoard("board", this.config);
  }

  onDropHandler(source, target, piece, newPos, oldPos, orientation) {
    const move = `${source}${target}`;
    this.moveRockIfCastle(move);

    return this.doMove(move)
      .then((_) => this.getBestMove())
      .then((cpuMove) => this.displayCpuMove(cpuMove))
      .then((_) => this.updatePosition());
  }

  moveRockIfCastle(moveCoordinates) {
    if (moveCoordinates === "e1g1") {
      this.board.move("h1-f1");
    } else if (moveCoordinates === "e1c1") {
      this.board.move("a1-d1");
    } else if (moveCoordinates === "e8g8") {
      this.board.move("h8-f8");
    } else if (moveCoordinates === "e8c8") {
      this.board.move("a8-d8");
    }
  }

  private doMove(move) {
    return this.chesEngineService.doMove(this.gameId, move).toPromise();
  }

  private getBestMove() {
    return this.chesEngineService.getBestMove(this.gameId).toPromise();
  }

  private displayCpuMove(cpuMove) {
    const cpuMoveUci = cpuMove.Move;
    this.moveCpu(this.formatUciMoveToUiMove(cpuMoveUci));

    return cpuMoveUci;
  }

  moveCpu(moveCoordinates) {
    if (moveCoordinates === "e1-g1") {
      this.board.move("e1-g1");
      this.board.move("h1-f1");
    } else if (moveCoordinates === "e1-a1") {
      this.board.move("e1-c1");
      this.board.move("a1-d1");
    } else if (moveCoordinates === "e8-g8") {
      this.board.move("e8-g8");
      this.board.move("h8-f8");
    } else if (moveCoordinates === "e8-c8") {
      this.board.move("e8-c8");
      this.board.move("a8-d8");
    } else {
      this.board.move(moveCoordinates);
    }
  }

  private formatUciMoveToUiMove(uciMove: any): any {
    return `${uciMove.substring(0, 2)}-${uciMove.substring(2, 4)}`;
  }

  private updatePosition() {
    this.config.position = this.board.position();
  }

  setGame() {
    this.gameOptions.push({ gameId: this.gameId });
    return this.chesEngineService
      .getGame(this.gameId)
      .toPromise()
      .then((response) => {
        this.setBoardPosition(response.Board);
        this.gameLoaded = true;
      });
  }

  private setBoardPosition(fenBoard: string) {
    this.config = this.getBoardConfig(fenBoard);
    this.board = ChessBoard("board", this.config);
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

  private loadGames() {
    return this.getGames().subscribe((response) => {
      this.gameOptions = response.Games.map((g) => {
        return <GameOption>{ gameId: g };
      });
    });
  }

  private getGames() {
    return this.chesEngineService.getGames();
  }

  newGame() {
    return this.createGame().then((response) => {
      this.gameId = response.GameId;
      this.setGame();

      return response;
    });
  }

  private createGame() {
    return this.chesEngineService.createGame().toPromise();
  }

  rotate() {
    this.switchOrientation();
    this.setBoard();
  }

  private switchOrientation() {
    this.orientation = this.orientation === "white" ? "black" : "white";
    this.config.orientation = this.orientation;
  }

  cpuPlay() {
    return this.getBestMove().then((cpuMove) => this.displayCpuMove(cpuMove));
  }

  undo() {
    return this.undoMove(this.gameId).then((response) => {
      this.setBoardPosition(response.PreviousPosition);

      return response.PreviousPosition;
    });
  }

  private undoMove(gameId) {
    return this.chesEngineService.undoMove(this.gameId).toPromise();
  }

  delete(gameId) {
    return this.deleteGame(this.gameId).then((response) => {
      this.gameId = undefined;
      this.setInitialBoardPosition();
      return this.loadGames();
    });
  }

  private deleteGame(gameId) {
    return this.chesEngineService.deleteGame(this.gameId).toPromise();
  }

  gameIsNotDefined() {
    return !this.gameId;
  }

  gameIsNotLoaded() {
    return !this.gameLoaded;
  }
}
