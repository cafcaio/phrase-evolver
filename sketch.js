var popSize;
var mutationRate;
var target;
var generations;
var dnaLength;
var matingPoolSize;

let population;

var bestFitness;
var bestFitnessIndex;
var averageFitness;



function setup() {
  //Parâmetros
  popSize = 200;
  mutationRate = 0.02;
  target = "To be or not to be.";
  generations = 0;
  dnaLength = target.length;
  matingPoolSize = popSize;


//
  population = new Population(popSize, dnaLength);
  createCanvas(1000, 1000);


}


//Equivalente à função void loop() do Arduino
//Executada 60 vezes por segundo (máximo FPS do computador)
function draw() {
  let cycleTime = millis();

  background(255);
  textFont("Courier New");

  generations++;


  let selectionTime = millis();


  //******** SELEÇÃO ********

  //Criação da mating pool (2 métodos disponíveis)

  // population.matingPoolFromLinearScaling(matingPoolSize);
  population.matingPoolFromLinearRanking(matingPoolSize);


  selectionTime = millis() - selectionTime;

  let bestFitness = -Infinity;
  let bestFitnessIndex = 0;


  let reproductionTime = millis();

  //******** REPRODUÇÃO ********
  for (let i = 0; i < popSize; i++) {

    //Escolhe dois pais
    let parentA = pickOne(population.matingPool);
    let parentB = pickOne(population.matingPool);

    //******** RECOMBINAÇÃO (crossover) ********
    let child = DNA.crossover(parentA, parentB);

    //******** MUTAÇÃO ********
    child.mutate(mutationRate);

    //Atualiza a nota (fitness) do indivíduo
    child.setFitness(target);

    //Insere o filho na população
    population.pop[i] = child;

    //Procura melhor nota para fins de exibição
    if (child.fitness > bestFitness) {
      bestFitness = child.fitness;
      bestFitnessIndex = i;
    }
  }
  reproductionTime = millis() - reproductionTime;

  //Calcula nota média para exibição
  averageFitness = population.getAverageFitness();

  cycleTime = millis() - cycleTime;


  //Imprime estatísticas
  let sW = 50;
  let sH = 200;
  textSize(12);
  text("Best fit: " + (bestFitness * 100).toFixed(1) + "%", sW, sH);
  textSize(36);
  text(population.pop[bestFitnessIndex].getPhenotype(), sW, sH + 36);
  textSize(12);
  text("Population size: " + popSize, sW, sH + 60);
  text("Mutation rate: " + (mutationRate * 100).toFixed(1) + "%", sW, sH + 80);
  text("Average fitness: " + (averageFitness * 100).toFixed(1) + "%", sW, sH + 100);
  text("Total generations: " + generations, sW, sH + 120);
  text("Time elapsed: " + (millis() / 1000).toFixed(1) + " s", sW, sH + 140);

  text("Mating pool size: " + matingPoolSize, sW, sH + 200);
  text("Selection time per cycle: " + selectionTime.toFixed(2) + " ms", sW, sH + 220);
  text("Reproduction time per cycle: " + reproductionTime.toFixed(2) + " ms", sW, sH + 240);
  text("Total cycle time: " + cycleTime.toFixed(2) + " ms", sW, sH + 280);


  let spacing = 20;
  let maxLines = (height - 30) / spacing;
  if(maxLines>population.pop.length) maxLines = population.pop.length;
  for (let i = 0; i < maxLines; i++) {
    text(population.pop[i].getPhenotype(), 600, 30 + spacing * i, 300);
  }


  //Para exibição se encontrar um indivíduo idêntico à frase-alvo
  if (bestFitness == 1) {
    noLoop();
  }


}
