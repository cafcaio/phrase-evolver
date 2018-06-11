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
  popSize = 200;
  mutationRate = 0.01;
  target = "To be or not to be.";
  generations = 0;
  dnaLength = target.length;
  matingPoolSize = popSize;

  population = new Population(popSize, dnaLength);

  createCanvas(1000, 1000);


}


function draw() {
  let cycleTime = millis();

  background(255);
  textFont("Courier New");

  generations++;


  let selectionTime = millis();


  //Selection


  //4 methods for selection

  // population.matingPoolFromLinearScaling(matingPoolSize);
  // population.matingPoolFromLinearRanking(matingPoolSize);
  // population.matingPoolFromSubtractMethod(matingPoolSize);
  population.matingPoolFromFPS(matingPoolSize);

  let matingPool = population.matingPool;


  selectionTime = millis() - selectionTime;

  let bestFitness = -Infinity;
  let bestFitnessIndex = 0;


  let reproductionTime = millis();

  for (let i = 0; i < popSize; i++) {

    let parentA = pickOne(matingPool);
    let parentB = pickOne(matingPool);


    let child = DNA.crossover(parentA, parentB);
    // let child = DNA.crossoverEnhanced(parentA, parentB); //much slower!

    child.mutate(mutationRate);
    child.setFitness(target);
    population.pop[i] = child;

    if (child.fitness > bestFitness) {
      bestFitness = child.fitness;
      bestFitnessIndex = i;
    }
  }
  reproductionTime = millis() - reproductionTime;


  averageFitness = population.getAverageFitness();

  cycleTime = millis() - cycleTime;


  //stats
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
  for (let i = 0; i < maxLines; i++) {
    text(population.pop[i].getPhenotype(), 600, 30 + spacing * i, 300);
  }



  if (bestFitness == 1) {
    noLoop();
  }


}
