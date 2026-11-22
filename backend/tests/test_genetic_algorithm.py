
import pytest
import genetic_algorithm as ga


def test_distance():
    """Проверка вычисления евклидова расстояния."""
    a = (0, 0)
    b = (3, 4)

    assert ga.distance(a, b) == 5.0


def test_generate_cities_reproducibility():
    """Проверка повторяемости генерации городов."""
    cities1 = ga.generate_cities(n=10, seed=42)
    cities2 = ga.generate_cities(n=10, seed=42)

    assert cities1 == cities2
    assert len(cities1) == 10


def test_route_length():
    """Проверка длины замкнутого маршрута."""
    cities = [
        (0, 0),
        (1, 0),
        (1, 1),
        (0, 1)
    ]
    route = [0, 1, 2, 3]

    assert ga.route_length(route, cities) == pytest.approx(4.0)


def test_init_population():
    """Проверка создания начальной популяции."""
    population = ga.init_population(pop_size=20, n_cities=10)

    assert len(population) == 20

    for route in population:
        assert len(route) == 10
        assert sorted(route) == list(range(10))


def test_select():
    """Проверка выбора лучшей особи турнирной селекцией."""
    cities = [
        (0, 0),
        (1, 0),
        (1, 1),
        (0, 1)
    ]

    best_route = [0, 1, 2, 3]
    other_route1 = [0, 2, 1, 3]
    other_route2 = [0, 1, 3, 2]

    population = [other_route1, best_route, other_route2]

    original_sample = ga.random.sample

    ga.random.sample = lambda population, k: population[:k]

    try:
        selected = ga.select(population, cities, k=3)
    finally:
        ga.random.sample = original_sample

    assert selected == best_route


def test_crossover():
    """Проверка корректности потомка после скрещивания."""
    parent1 = [0, 1, 2, 3, 4, 5]
    parent2 = [5, 4, 3, 2, 1, 0]

    child = ga.crossover(parent1, parent2)

    assert len(child) == len(parent1)
    assert sorted(child) == list(range(6))


def test_crossover_preserves_parent_segment(monkeypatch):
    """Проверка сохранения фрагмента первого родителя."""
    parent1 = [0, 1, 2, 3, 4, 5]
    parent2 = [5, 4, 3, 2, 1, 0]

    monkeypatch.setattr(
        ga.random,
        "sample",
        lambda population, k: [1, 3]
    )

    child = ga.crossover(parent1, parent2)

    assert child[1:4] == parent1[1:4]


def test_swap_mutate_zero_rate():
    """Проверка отсутствия мутации при вероятности 0."""
    route = [0, 1, 2, 3, 4]

    mutated = ga.swap_mutate(route, mutation_rate=0)

    assert mutated == route
    assert mutated is not route
    assert route == [0, 1, 2, 3, 4]


def test_swap_mutate_preserves_cities():
    """Проверка сохранения всех городов после мутации."""
    route = [0, 1, 2, 3, 4, 5]

    mutated = ga.swap_mutate(route, mutation_rate=1.0)

    assert len(mutated) == len(route)
    assert sorted(mutated) == sorted(route)


def test_genetic_algorithm():
    """Проверка работы генетического алгоритма."""
    cities = ga.generate_cities(n=10, seed=42)

    best_route, best_length, history, route_history = (
        ga.genetic_algorithm(
            cities,
            pop_size=20,
            generations=15,
            mutation_rate=0.05,
            elite_size=2,
            tournament_k=3
        )
    )

    assert len(best_route) == 10
    assert sorted(best_route) == list(range(10))

    assert best_length > 0
    assert best_length == pytest.approx(
        ga.route_length(best_route, cities)
    )

    assert len(history) == 15
    assert len(route_history) == 15

    # Лучшее решение не должно ухудшаться с поколениями
    for i in range(1, len(history)):
        assert history[i] <= history[i - 1]

    for route in route_history:
        assert len(route) == 10
        assert sorted(route) == list(range(10))
