import numpy
import random

# This is the Random Number Generator.
class RNG():
  def __init__(self, seed: int) -> None:
    self.python_rndgen = random.Random(seed)
    self.numpy_rndgen = numpy.random.default_rng(seed)
    self.keith_rndgen = KeithRNG(seed)

  # From test_clustering
  def random(self) -> float:
    # return self.python_rndgen.random()
    return self.keith_rndgen.random()

  # From mathematician
  def choice(self, seq):
    # return self.python_rndgen.choice(seq)
    return self.keith_rndgen.choice(seq)

  # From soft_kmeans
  def sample(self, population, k):
    # return self.python_rndgen.sample(population, k)
    return self.keith_rndgen.sample(population, k)

  # From soft_kmeans
  # Generates a random sample from a given 1-D array
  def randomSample(self, a, size):
    # This is only used in dead code, so don't forward to keith_rndgen.
    return self.numpy_rndgen.choice(a, size)

  

# See https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
class KeithRNG():
  def __init__(self, seed: int) -> None:
    self.seed = seed
    self.modulus = 2**31
    self.multiplier = 1664525
    self.increment = 1013904223

  def _next_int(self) -> int:
    next_int = (self.multiplier * self.seed + self.increment) % self.modulus
    self.seed = next_int
    return next_int

  def _next_float(self) -> float:
    next_float = self._next_int() / self.modulus
    return next_float

  def _next_int_below(self, limit: int) -> int:
    return self._next_int() % limit

  def random(self) -> float:
    return self._next_float()

  # From mathematician
  def choice(self, seq):
    return seq[self._next_int_below(len(seq))]

  # From soft_kmeans
  def sample(self, population, k):
    k = min(k, len(population))
    duplicate = [value for value in population] # works on a range
    result = []
    for i in range(k):
      next_int = self._next_int_below(len(duplicate))
      value = duplicate[next_int]
      del duplicate[next_int]
      result.append(value)
    return result
