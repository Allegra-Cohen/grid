from .rng import KeithRNG

def test_next_int():
	seed = 42
	rng = KeithRNG(seed)
	expected_values = [1083814273, 378494188, 331920219, 955863294, 1613448261]
	actual_values = [rng._next_int() for expected_value in expected_values]
	print(actual_values)

def test_next_int_below():
	seed = 42
	rng = KeithRNG(seed)
	expected_values = [3, 8, 9, 4, 1, 2, 5, 2, 1, 6]
	actual_values = [rng._next_int_below(10) for expected_value in expected_values]
	print(actual_values)

def test_random():
	seed = 42
	rng = KeithRNG(seed)
	expected_values = [5046, 1762, 1545, 4451, 7513, 513, 8945, 2369, 7476, 9892]
	actual_values = [int(rng.random() * 10000) for expected_value in expected_values]
	print(actual_values)

def test_choice():
	seed = 42
	rng = KeithRNG(seed)
	population = [ 0, 1, 2, 3, 4]
	expected_values = [3, 3, 4, 4, 1, 2, 0, 2, 1, 1]
	actual_values = [rng.choice(population) for expected_value in expected_values]
	print(actual_values)

def test_sample():
	seed = 42
	rng = KeithRNG(seed)
	population = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	expected_values = [3, 8, 4, 1, 6, 5, 9, 2, 7, 0]
	actual_values = rng.sample(population, 10)
	print(actual_values)

if __name__ == "__main__":
	result = test_next_int()
	result = test_next_int_below()
	result = test_random()
	result = test_choice()
	result = test_sample()
	