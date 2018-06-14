//Funções auxiliares

//Função de comparação que ordena a população de acordo
//com sua nota (fitness) em ordem decrescente
function compare(a, b) {
  if (a.fitness > b.fitness)
    return -1;
  if (a.fitness < b.fitness)
    return 1;
  return 0;
}


//Escolhe um número inteiro aleatório entre min (inclusive) e max (INCLUSIVE).
//Adaptação da função nativa Math.random(), que escolhe um número
//pseudoaleatório entre 0 (inclusive) e 1 (não-inclusive)
function randomInt(min, max) {
  let value = Math.floor(min + (max - min + 1) * Math.random());
  return value;
}


//Escolhe um elemento aleatório de um array qualquer
function pickOne(array) {
  let index = Math.floor(array.length * Math.random());
  return array[index];
}


class DNA {

  //construtor da classe DNA
  constructor(input) {

    //se receber um número, cria um DNA aleatório
    if (typeof(input) == "number") {
      this.length = input;

      //inicializa array de alelos/genes
      this.genes = [];

      for (let i = 0; i < this.length; i++) {
        //define o genótipo (códigos ASCII entre 32 e 126)
        let gene = randomInt(32, 126);
        this.genes.push(gene);
      }
    }

    //se receber um vector de genes (object), então cria um DNA com eles
    if (typeof(input) == "object") {
      this.genes = input;
      this.length = input.length;
    }
  }

  //calcula a adequação de um certo DNA
  getFitness(target) {
    let fit = 0;

    //checa se cada letra em cada posição
    //em relação à frase alvo e soma 1 na pontuação, caso combinem
    for (let i = 0; i < this.genes.length; i++) {
      if (target.charCodeAt(i) == this.genes[i]) {
        fit++;
      }
    }
    fit = fit / target.length;

    //para aumentar a pressão populacional, a adequação foi elevada ao quadrado
    //atenção: isso deve ser testado para cada caso! Algumas aplicações
    //podem requerer operações diferentes e/ou falharem com esse método
    fit = fit ** 2;
    return fit;
  }

  //cria um atributo fitness para o DNA com base na função getFitness()
  setFitness(target) {
    let score = this.getFitness(target);
    this.fitness = score;
  }

  //converte os alelos numéricos em letras, formando a frase (o fenótipo)
  getPhenotype() {
    //função apply aplica a função fromCharCode() a todos os elementos
    //do array this.genes
    return String.fromCharCode.apply(null, this.genes);
  }


  //******** RECOMBINAÇÃO (CROSSOVER) ********
  //recombina dois parentes para formar um filho
  static crossover(parentA, parentB) {
    let size = parentA.length;
    let child;

    //escolhe um ponto de corte aleatório
    let midpoint = randomInt(0, parentA.length - 1);

    //array de genes do filho
    let childCodes = [];

    //popula o array baseado nos parentes
    //antes do ponto de corte, material do parente A
    //depois do ponto de corte, material do parente B
    for (let i = 0; i < size; i++) {
      if (i < midpoint) {
        childCodes.push(parentA.genes[i]);
      } else {
        childCodes.push(parentB.genes[i]);
      }
    }

    //cria um objeto DNA com os novos genes recombinados
    child = new DNA(childCodes);
    return child;
  }

  //******** MUTAÇÃO ********
  //percorre todo o DNA e, dependendo de mutationRate, realiza uma mutação
  //numa posição aleatória, trocando um código ASCII original por um qualquer
  mutate(mutationRate) {
    for (let i = 0; i < this.length; i++) {
      if (Math.random() < mutationRate) {
        this.genes[i] = randomInt(32, 126);
      }
    }
  }
}



class Population {

  //construtor da classe Population
  constructor(popSize, dnaLength) {
    this.popSize = popSize; //tamanho da população
    this.dnaLength = dnaLength; //tamanho do DNA (tamanho da string)
    this.pop = []; //inicializa população

    for (let i = 0; i < this.popSize; i++) {
      //******** CRIAÇÃO DOS CHUTES INICIAIS ********
      //insere um objeto DNA criado aleatoriamente com tamanho dnaLength
      this.pop.push(new DNA(dnaLength));

      //calcula adequação de cada indivíduo
      this.pop[i].setFitness(target);
    }
  }

  //função auxiliar
  //encontra a máxima adequação na população

  getMaxFitness() {
    let maxFitness = 0;
    for (let i = 0; i < this.popSize; i++) {
      if (this.pop[i].fitness > maxFitness) {
        maxFitness = this.pop[i].fitness;
      }
    }
    return maxFitness;
  }


  //******** CRIAÇÃO DA MATING POOL ********
  //Linear Scaling method
  //Usa o método de aceitação-rejeição (rejection sampling) baseado
  //numa probabilidade calculada de acordo com a necessidade
  //sem a geração de tabelas de probabilidade

  matingPoolFromLinearScaling(size) {

    //zera mating pool
    this.matingPool = [];

    //calcula a maior adequação dentre os indivíduos da população
    let maxFitness = this.getMaxFitness();

    //método de amostra por rejeição (rejection sampling)
    //da família de métodos de Monte Carlo
    while (this.matingPool.length < size) {

      //escolhe elemento qualquer da população
      let toEnterRank = randomInt(0, this.popSize - 1);

      //normaliza de acordo com o elemento de máxima adequação
      let p = this.pop[toEnterRank].fitness / maxFitness;

      //aceita ou rejeita até preencher a mating pool com o número desejado
      if (Math.random() < p) {
        this.matingPool.push(this.pop[toEnterRank]);
      }
    }
  }


  //Linear Ranking method
  //Neste método, a lista é sorteada de acordo com a adequação
  //dos elementos, i.e., o elemento mais adequado está no topo.
  //A adequação é SUBSTITUÍDA por uma nota que depende do quão
  //alto o indivíduo está na lista. A seleção é feita pelo
  //método da aceitação rejeição.

  matingPoolFromLinearRanking(size) {

    //zera mating pool
    this.matingPool = [];

    //ordena a lista em ordem decrescente
    this.pop.sort(compare);

    //soma da progressão aritmética dos índices
    let ranksSum = this.popSize * (this.popSize - 1) / 2;

    //máxima adequação = adequação do primeiro elemento da lista ordenada
    let maxFitness = this.popSize / ranksSum;

    while (this.matingPool.length < size) {
      let toEnterRank = randomInt(0, popSize - 1);

      //calcula a probabilidade on-the-go e normaliza de acordo com a máxima adequação
      let p = (this.popSize - toEnterRank) / ranksSum;
      p = p / maxFitness;

      //método da aceitação-rejeição determina se o indivíduo estará na mating pool
      if (Math.random() < p) {
        this.matingPool.push(this.pop[toEnterRank]);
      }
    }
  }

  //função auxiliar
  //calcula soma das notas
  getFitnessSum() {
    let sum = 0;
    for (let i = 0; i < this.popSize; i++) {
      sum += this.pop[i].fitness;
    }
    return sum;
  }

  //função auxiliar
  //calcula média das notas
  getAverageFitness() {
    let sum = this.getFitnessSum();
    return sum / this.popSize;
  }


}
