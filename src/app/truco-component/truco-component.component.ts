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
  blockUser: boolean = false;

  cards: Card[] = [];
  userCards: Card[] = [];
  botCards: Card[] = [];
  manilha!: Card;

  selectedUserCard?: Card;
  selectedBotCard?: Card;

  constructor() { }

  ngOnInit() {
    this.distribuirCartas();
  }

  // LOGICA DE JOGO

  selectUserCard(card: Card) {
    this.removeCard(card, this.userCards);
    this.selectedUserCard = card;
    this.blockUser = true;
    if (this.selectedBotCard) {
      var winner = this.getWinner();
      console.log(winner, 'ganhou o jogo')
    }
    else
      this.playBot();
  }

  private playBot() {
    // Se o usuario que jogou primeiro
    if (this.selectedUserCard != null) {
      // colocar a logica para escolher carta do bot aqui depois
      this.selectedBotCard = this.botCards[1];
      var winner = this.getWinner();
      console.log(winner, 'ganhador');
      this.selectedBotCard = undefined;
      this.selectedUserCard = undefined;

      if (winner == 'user') {
        this.blockUser = false;
      }
      else if (winner == 'bot') {
        this.playBot();
      }
      else {
        // aqui pega quem fez o primeiro ponto ou user
      }
    }
    else {
      console.log('bot jogando de novo')
      // colocar a logica para escolher carta do bot aqui depois
      this.selectedBotCard = this.botCards[0];
      this.blockUser = false;
      console.log(this.selectedBotCard, 'proxima carta bot')
    }
  }

  private removeCard(card: Card, deck: Card[]) {
    const index = deck.indexOf(card);
    if (index !== -1) {
      deck.splice(index, 1);
    }
  }

  // CALCULO DE PONTOS

  private getWinner() {
    console.log(this.selectedBotCard, 'bot', this.selectedUserCard, 'user')
    // verifica se alguem jogou manilha -> ganha quem jogou ja
    if (this.selectedBotCard?.numero == this.manilha.numero) {
      return 'bot';
    }
    if (this.selectedUserCard?.numero == this.manilha.numero) {
      return 'user';
    }
    // se os dois jogaram manilha verifica o naipe
    if (this.selectedBotCard?.numero == this.manilha.numero && this.selectedUserCard?.numero == this.manilha.numero) {
      return this.verifyNaipe();
    }
    // verificação das outras cartas
    return this.calculate();

    // FAZER O CALCULO DO PLACAR DA RODADA E O GERAL !!!!!!
  }

  private verifyNaipe() {
    var naipe = ['Paus', 'Copas', 'Espadas', 'Ouros'];
    const user = naipe.indexOf(this.selectedUserCard?.naipe!);
    const bot = naipe.indexOf(this.selectedBotCard?.naipe!);

    let vencedor = user !== -1 && bot !== -1 && user > bot;
    // testar ver se aqui esta certo o retorno
    // tem que ter a possibilidade de dar empate
    return vencedor ? 'user' : 'bot';
  }

  private calculate() {
    // testar essa lista depois (o 4 do final)
    var numeros = [4, 5, 6, 7, 10, 11, 12, 1, 2, 3, 4];
    const user = numeros.indexOf(this.selectedUserCard?.numero ?? 0);
    const bot = numeros.indexOf(this.selectedBotCard?.numero ?? 0);

    let vencedor = user !== -1 && bot !== -1 && user > bot;
    // testar ver se aqui esta certo o retorno
    return vencedor ? 'user' : 'bot';
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

  private distribuirCartas() {
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
    this.userCards = this.cards.slice(0,3);
    this.botCards = this.cards.slice(3,6);
    this.manilha = this.cards.slice(6,7)[0];
    this.gameStarted = true;
    console.log(this.manilha, 'manilha');
  }

  private createRandomCard(user: boolean) {
    return ({
      numero: this.getRandomNumber(),
      naipe: this.getRandomNaipe(),
      showing: user,
    }) as Card;
  }

  private getRandomNaipe() {
    const enumValues = Object.values(Naipe);
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
  }

  private getRandomNumber() {
    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * (12 - 1) + 1);
    } while (randomNumber === 8 || randomNumber === 9);
    return randomNumber;
  }
}
