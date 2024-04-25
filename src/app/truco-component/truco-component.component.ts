import { Component, OnInit } from '@angular/core';
import { Card, Naipe } from '../domain/Card';

@Component({
  selector: 'truco-component',
  templateUrl: './truco-component.component.html',
  styleUrls: ['./truco-component.component.scss']
})
export class TrucoComponentComponent implements OnInit {
  gameStarted: boolean = false;
  cardCombination = new Set<string>();
  hideBotCards: boolean = true;

  cards: Card[] = [];

  constructor() { }

  ngOnInit() {
  }

  



  // ESCONDER CARTAS DO BOT

  hideCards(event: any) {
    const botCard = this.cards.slice(3, 6)
    botCard.forEach(card => {
      card.showing = event;
    })
    this.hideBotCards = event;
  }

  // EMBARALHAMENTO METHODS

  distribuirCartas() {
    if (this.gameStarted) return;

    let user = true;
    let cont = 0
    while (this.cards.length < 7) {
      let card = this.createRandomCard(user);
      let cardKey = `${card.numero}-${card.naipe}`;

      if (!this.cardCombination.has(cardKey)) {
        cont = cont + 1;
        if (cont > 2)
          user = false;
        this.cards.push(card);
        this.cardCombination.add(cardKey);
      }
    }
    this.gameStarted = true;
  }

  createRandomCard(user: boolean) {
    return ({
      numero: this.getRandomNumber(),
      naipe: this.getRandomNaipe(),
      showing: user,
    }) as Card;
  }

  getRandomNaipe() {
    const enumValues = Object.values(Naipe);
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
  }

  getRandomNumber() {
    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * (12 - 1) + 1);
    } while (randomNumber === 8 || randomNumber === 9);
    return randomNumber;
  }
}
