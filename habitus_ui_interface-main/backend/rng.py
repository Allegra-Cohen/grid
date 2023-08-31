import numpy
import random

# This is the Random Number Generator.
class RNG():
  def __init__(self, seed: int) -> None:
    self.rndgen = random.Random(seed)

  # From test_clustering
  def random(self) -> float:
    return self.rndgen.random()

  # From mathematician
  def choice(self, seq):
    return self.rndgen.choice(seq)

  # From soft_kmeans
  def sample(self, population, k):
    return self.rndgen.sample(population, k)

  # From soft_kmeans calls random.sample
  def randomSample(self, population, k):
    return self.rndgen.sample(population, k)
  
  def randomChoice(self, a, size):
    return numpy.random.choice(a, size)
