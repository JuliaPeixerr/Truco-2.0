import { Component, OnInit } from '@angular/core';
import { Card, Naipe } from '../domain/Card';
import { log } from 'console';
import { GameService } from './truco.service';

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
  botPtRodada: number[] = [];
  userPtRodada: number[] = [];
  empaxou: boolean = false;

  selectedUserCard?: Card;
  selectedBotCard?: Card;


  finalizouRodada: boolean = false;
  ganhadorRodada: string = "";

  finalizouJogo: boolean = false;
  userPontGeral: number = 0;
  botPontGeral: number = 0;

  truco: number = 0;

  constructor(
    private gameService: GameService
  ) {
   }

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
      this.removeCard(this.selectedBotCard, this.botCards);
      if (this.finalizouRodada) {
        this.gameStarted = false;
        this.distribuirCartas();
        this.resetPtRodada();
      }
    }
    else
      this.playBot();
  }

  private playBot() {
    // Se o usuario que jogou primeiro
    if (this.selectedUserCard != null) {
      // colocar a logica para escolher carta do bot aqui depois
      this.selectedBotCard = this.gameService.chooseBotCard(this.botCards, this.empaxou, this.botPtRodada, this.manilha)
      // this.selectedBotCard = this.botCards[1];
      console.log('bot jogou', this.selectedBotCard)
      var winner = this.getWinner();
      this.removeCard(this.selectedBotCard!, this.botCards);
      this.selectedBotCard = undefined;
      this.selectedUserCard = undefined;

      if (this.finalizouRodada) {
        this.distribuirCartas();
        this.resetPtRodada();
        this.gameStarted = false;
      } else {
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
    }
    else {
      // colocar a logica para escolher carta do bot aqui depois
      this.selectedBotCard = this.botCards[0];
      this.blockUser = false;
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
    // verifica se alguem jogou manilha -> ganha quem jogou ja
    console.log('user', this.selectedUserCard, 'bot', this.selectedBotCard)
    if (this.selectedBotCard?.numero == this.manilha.numero) {
      this.distribuiPontuacao('bot');
      return 'bot';
    }
    if (this.selectedUserCard?.numero == this.manilha.numero) {
      this.distribuiPontuacao('user');
      return 'user';
    }
    // se os dois jogaram manilha verifica o naipe
    if (this.selectedBotCard?.numero == this.manilha.numero && this.selectedUserCard?.numero == this.manilha.numero) {
      let vencedor = this.verifyNaipe();
      return vencedor;
    }
    // verificação das outras cartas
    let vencedor = this.calculate();
    this.distribuiPontuacao(vencedor);
    return this.calculate()

    // FAZER O CALCULO DO PLACAR DA RODADA E O GERAL !!!!!!
  }


  //distribui a pontuação da rodada
  private distribuiPontuacao(vencedor: string) {
    if (vencedor == 'bot') {
      this.botPtRodada.push(1);
      this.verificaFimRodada();
    }
    else if (vencedor == 'user') {
      this.userPtRodada.push(1);
      this.verificaFimRodada();
    }
    else {
      this.botPtRodada.push(1);
      this.userPtRodada.push(1);
      this.empaxou = true;
      this.verificaFimRodada();
    }
  }

  //reseta variaveis da rodada
  private resetPtRodada() {
    this.finalizouRodada = false;
    this.ganhadorRodada = '';
    this.userPtRodada = [];
    this.botPtRodada = [];
    this.empaxou = false;
    this.truco = 0;
  }

  //verifica o fim da rodada
  private verificaFimRodada() {
    if (this.botPtRodada.length > 1) {
      this.finalizouRodada = true;
      this.ganhadorRodada = "bot"
      this.pontuacaoJogo(this.ganhadorRodada);
    } else if (this.userPtRodada.length > 1) {
      this.finalizouRodada = true;
      this.ganhadorRodada = "user";
      this.pontuacaoJogo(this.ganhadorRodada);
    }
  }

  //atualiza pontuação do jogo e verifica se ja acabou
  private pontuacaoJogo(vencedor: string) {
    let pontuacao = 1;
    if (this.truco > 0) {
      pontuacao = this.truco;
    }
    if (vencedor == 'user')
      this.userPontGeral = this.userPontGeral + pontuacao;
    else if (vencedor == 'bot') {
      this.botPontGeral = this.botPontGeral + pontuacao;
    }
  }

  isTruco() {
    if (this.truco == 12) return;
    this.truco = this.truco + 3
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

    console.log(user, bot, "calu")

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
    this.userCards = this.cards.slice(0, 3);
    this.botCards = this.cards.slice(3, 6);
    this.manilha = this.cards.slice(6, 7)[0];
    console.log(this.manilha, 'manilha')
    this.gameStarted = true;
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
