function compare(a, b) {
  if (a.fitness > b.fitness)
    return -1;
  if (a.fitness < b.fitness)
    return 1;
  return 0;
}

function pickOneWeighted(array, sumOfWeights) {
  let r = Math.random();
  let index = 0;
  while (r > 0) {
    r -= array[index].fitness / sumOfWeights;
    index++;
  }
  index--;
  return array[index];

}

function randomInteger(min, max) {
  let value = Math.floor(min + (max - min + 1) * Math.random());
  return value;
}

function pickOne(array) {
  let index = Math.floor(array.length * Math.random());
  return array[index];
}


class DNA {

  constructor(input) {
    if (typeof(input) == "number") {
      this.length = input;
      //initialize genes
      this.genes = []; //genes with numerical values (genotype)
      for (let i = 0; i < this.length; i++) { //defines genotype for a given type of problem
        let gene = randomInteger(32, 126); //gives a number between 32 and 126
        this.genes.push(gene);
      }
    }

    if (typeof(input) == "object") {
      this.genes = input;
      this.length = input.length;
    }
  }

  setFitness(target) { //target string to compare
    let score = 0;
    for (let i = 0; i < this.genes.length; i++) {
      if (target.charCodeAt(i) == this.genes[i]) {
        score++;
      }
    }
    this.fitness = score / target.length;
    this.fitness = this.fitness ** 2;
    return this.fitness;
  }

  getFitness(target) {//gets fitness from instance of DNA
    let score = 0;
    let fit;
    for (let i = 0; i < this.genes.length; i++) {
      if (target.charCodeAt(i) == this.genes[i]) {
        score++;
      }
    }
    fit = score / target.length;
    fit = fit ** 2;
    return fit;
  }

  static getFitnessFromArray(array, target){//gets fitness from any genes array directly, to avoid creation of new DNA instance
    let score = 0;
    let fit;
    for (let i = 0; i < array.length; i++) {
      if (target.charCodeAt(i) == array[i]) {
        score++;
      }
    }
    fit = score / target.length;
    fit = fit ** 2;
    return fit;
  }

  getPhenotype() {
    return String.fromCharCode.apply(null, this.genes);
  }


  static crossover(parentA, parentB) {
    let size = parentA.length;
    let child;
    let midpoint = randomInteger(0, parentA.length - 1);
    let childCodes = [];
    for (let i = 0; i < size; i++) {
      if (i < midpoint) {
        childCodes.push(parentA.genes[i]);
      } else {
        childCodes.push(parentB.genes[i]);
      }
    }
    child = new DNA(childCodes);
    return child;
  }

  static crossoverEnhanced(parentA, parentB){
    let size = parentA.length;
    let child;
    let midpoint = 0;
    let bestMidpoint = 0;
    let bestFitness = -Infinity;
    let tempFitness;

    while(midpoint < size) {
      let childCodes = [];
      for(let i=0; i<midpoint; i++) {
        childCodes.push(parentA.genes[i]);
      }
      for(let i=midpoint; i<size; i++) {
        childCodes.push(parentB.genes[i]);
      }

      if(DNA.getFitnessFromArray(childCodes, target) > bestFitness){
        bestMidpoint = midpoint;
      }
      midpoint++;

    }

    //creates best crossover
    let childCodes = [];
    for(let i=0; i<bestMidpoint; i++) {
      childCodes.push(parentA.genes[i]);
    }

    for(let i=bestMidpoint; i<size; i++) {
      childCodes.push(parentB.genes[i]);
    }



    child = new DNA(childCodes);
    return child;
  }

  mutate(mutationRate) {
    for (let i = 0; i < this.length; i++) {
      if (Math.random() < mutationRate) {
        this.genes[i] = randomInteger(32, 126);
      }
    }
  }


}



class Population {
  constructor(popSize, dnaLength) {
    this.popSize = popSize;
    this.dnaLength = dnaLength;
    this.pop = [];
    for (let i = 0; i < this.popSize; i++) {
      this.pop.push(new DNA(dnaLength));
      this.pop[i].setFitness(target);
    }
  }

  matingPoolFromLinearScaling(size) { //working
    // Dan Shiffman's fitness scaling method
    this.matingPool = [];
    let maxFitness = 0;
    for (let i = 0; i < this.popSize; i++) {
      if (this.pop[i].fitness > maxFitness) {
        maxFitness = this.pop[i].fitness;
      }
    }


    while (this.matingPool.length < size) {
      let toEnterRank = randomInteger(0, this.popSize - 1);
      let p = map(this.pop[toEnterRank].fitness, 0, maxFitness, 0, 1);
      if (Math.random() < p) {
        this.matingPool.push(this.pop[toEnterRank]);
      }
    }

  }


  matingPoolFromLinearRanking(size) { //uses linear ranking method to produce mating pool, working as intended
    this.matingPool = [];
    this.pop.sort(compare);
    let ranksSum = this.popSize * (this.popSize - 1) / 2;
    let maxFitness = this.popSize / ranksSum;

    while (this.matingPool.length < size) {
      let toEnterRank = randomInteger(0, popSize - 1);
      let p = (this.popSize - toEnterRank) / ranksSum;

      p = map(p, 0, maxFitness, 0, 1);
      if (Math.random() < p) {
        this.matingPool.push(this.pop[toEnterRank]);
      }
    }


  }

  getFitnessSum() {
    let sum = 0;
    for (let i = 0; i < this.popSize; i++) {
      sum += this.pop[i].fitness;
    }
    return sum;
  }

  matingPoolFromSubtractMethod(size) { //uses subtraction method + modified Monte Carlo
    this.matingPool = [];
    for (let i = 0; i < size; i++) {
      this.matingPool.push(pickOneWeighted(population.pop, this.getFitnessSum()));
    }
  }

  generateProbTable() { //takes an ordered list
    let probTable = [];
    let fitnessSum = this.getFitnessSum();

    for (let i = 0; i < this.pop.length; i++) {
      probTable.push(this.pop[i].fitness / fitnessSum);
    }
    for (let i = 0; i < this.popSize; i++) {
      for (let j = i + 1; j < this.popSize; j++) {
        probTable[i] += probTable[j];
      }
    }
    return probTable;
  }

  matingPoolFromFPS(size) { //uses sorting + Fitness Proportionate Sorting + Monte Carlo method
    this.matingPool = [];
    this.pop.sort(compare);
    let probTable = this.generateProbTable();

    while (this.matingPool.length < size) {
      let toEnterRank = randomInteger(0, this.popSize - 1);
      let p = probTable[toEnterRank];
      if (Math.random() < p) {
        this.matingPool.push(this.pop[toEnterRank]);

      }
    }

  }

  getAverageFitness() {
    let sum = this.getFitnessSum();
    return sum / this.popSize;
  }


}
