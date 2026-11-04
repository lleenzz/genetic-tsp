import random
import math


def generate_cities(n=20, seed=42):
    """ Генерирует n случайных городов на плоскости 100x100. """
    random.seed(seed)
    return [(random.uniform(0, 100), random.uniform(0, 100)) for _ in range(n)]


def distance(a, b):
    """ Вычисляет евклидово расстояние между двумя точками. """
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)


def route_length(route, cities):
    """
    Целевая функция (фитнес): вычисляет суммарную длину замкнутого маршрута.

    Аргументы:
        route  - маршрут в виде списка индексов городов
        cities - список координат городов

    """
    return sum(distance(cities[route[i]], cities[route[i - 1]]) for i in range(len(route)))


def init_population(pop_size, n_cities):
    """
    Формирует начальную популяцию.

    Аргументы:
        pop_size - количество особей в популяции
        n_cities - количество городов

    """
    base = list(range(n_cities))
    return [random.sample(base, n_cities) for _ in range(pop_size)]


def select(population, cities, k=5):
    """
    Реализует турнирную селекцию.
    Из k случайно выбранных особей возвращает особь с наименьшей длиной маршрута.

    Аргументы:
        population - текущая популяция
        cities     - список координат городов
        k          - размер турнирной группы

    """
    contestants = random.sample(population, k)
    return min(contestants, key=lambda r: route_length(r, cities))


def crossover(parent1, parent2):
    """
    Реализует оператор упорядоченного скрещивания (Order Crossover, OX).
    Случайный подотрезок наследуется от первого родителя,
    оставшиеся гены заполняются в порядке их следования у второго родителя.
    Гарантирует корректность особи: каждый город присутствует ровно один раз.

    """
    n = len(parent1)

    # Определение границ копируемого отрезка
    a, b = sorted(random.sample(range(n), 2))

    # Копирование отрезка от первого родителя
    child = [None] * n
    child[a:b + 1] = parent1[a:b + 1]

    # Заполнение оставшихся позиции генами второго родителя
    fill = [el for el in parent2 if el not in child]
    idx = 0
    for i in range(n):
        if child[i] is None:
            child[i] = fill[idx]
            idx += 1

    return child


def swap_mutate(route, mutation_rate):
    """
    Реализует оператор мутации обменом (Swap Mutation).
    Каждый ген с заданной вероятностью обменивается местами со случайно выбранным геном.

    Аргументы:
        route         - список индексов городов
        mutation_rate - вероятность мутации каждого гена

    """
    route = route[:]
    for i in range(len(route)):
        if random.random() < mutation_rate:
            j = random.randrange(len(route))
            route[i], route[j] = route[j], route[i]
    return route


def genetic_algorithm(
    cities,
    pop_size=200,
    generations=200,
    mutation_rate=0.02,
    elite_size=10,
    tournament_k=5,
):
    """
    Основной цикл генетического алгоритма для задачи TSP.

    Аргументы:
        cities        - список координат городов
        pop_size      - численность популяции
        generations   - количество поколений
        mutation_rate - вероятность мутации отдельного гена
        elite_size    - количество элитных особей, переходящих без изменений
        tournament_k  - размер турнирной группы при селекции

    Возвращает:
        best_route   - лучший найденный маршрут
        best_length  - длина лучшего маршрута
        history      - список лучших длин по поколениям
    """

    population = init_population(pop_size, len(cities))

    best_route = min(population, key=lambda r: route_length(r, cities))
    best_length = route_length(best_route, cities)
    history = []

    for gen in range(generations):

        population.sort(key=lambda r: route_length(r, cities))

        # Перенос элитных особей в следующее поколение без изменений
        new_pop = population[:elite_size]

        # Формирование потомков посредством селекции, скрещивания и мутации
        while len(new_pop) < pop_size:
            p1 = select(population, cities, tournament_k)
            p2 = select(population, cities, tournament_k)
            child = crossover(p1, p2)
            child = swap_mutate(child, mutation_rate)
            new_pop.append(child)

        population = new_pop

        gen_best = min(population, key=lambda r: route_length(r, cities))
        gen_best_len = route_length(gen_best, cities)

        if gen_best_len < best_length:
            best_length = gen_best_len
            best_route = gen_best

        history.append(best_length)

    return best_route, best_length, history