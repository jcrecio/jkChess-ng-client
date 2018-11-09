import { Component } from '@angular/core';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
@Injectable()
export class AppComponent {
  title = 'ngGlobalChess';

  startingGame = '1';

  constructor() {
  }
}
