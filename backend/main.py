import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from genetic_algorithm import (
    generate_cities,
    route_length,
    init_population,
    select,
    crossover,
    swap_mutate,
)


app = FastAPI(title="TSP Genetic Algorithm WebSocket API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/solve")
async def websocket_solve_tsp(websocket: WebSocket):
    await websocket.accept()

    try:
        # Получаем параметры от фронтенда
        data = await websocket.receive_json()

        n_cities = data.get("n_cities", 25)
        pop_size = data.get("pop_size", 200)
        generations = data.get("generations", 200)
        mutation_rate = data.get("mutation_rate", 0.02)
        elite_size = data.get("elite_size", 10)
        tournament_k = data.get("tournament_k", 5)
        seed = data.get("seed", 42)

        # Генерируем города
        raw_cities = generate_cities(n=n_cities, seed=seed)
        cities_list = [
            {"id": i, "x": city[0], "y": city[1]}
            for i, city in enumerate(raw_cities)
        ]

        # Создаём начальную популяцию
        population = init_population(pop_size, len(raw_cities))

        best_route = min(
            population,
            key=lambda route: route_length(route, raw_cities),
        )
        best_length = route_length(best_route, raw_cities)

        # История лучшего значения целевой функции по поколениям.
        # Элемент с индексом 0 соответствует первому поколению.
        history = []

        # Отправляем начальное состояние до начала эволюции
        await websocket.send_json({
            "type": "init",
            "cities": cities_list,
            "route": best_route,
            "length": round(best_length, 2),
            "generation": 0,
            "history": history,
        })

        # Основной цикл генетического алгоритма
        for gen in range(generations):
            population.sort(
                key=lambda route: route_length(route, raw_cities)
            )

            # Элитизм: переносим лучшие особи без изменений
            new_pop = population[:elite_size]

            # Создаём потомков с помощью селекции,
            # скрещивания и мутации
            while len(new_pop) < pop_size:
                parent1 = select(population, raw_cities, tournament_k)
                parent2 = select(population, raw_cities, tournament_k)

                child = crossover(parent1, parent2)
                child = swap_mutate(child, mutation_rate)

                new_pop.append(child)

            population = new_pop

            # Находим лучшее решение текущего поколения
            gen_best = min(
                population,
                key=lambda route: route_length(route, raw_cities),
            )
            gen_best_length = route_length(gen_best, raw_cities)

            # Обновляем глобально лучшее решение,
            # если найден маршрут короче предыдущего
            if gen_best_length < best_length:
                best_length = gen_best_length
                best_route = gen_best

            current_gen = gen + 1

            # Сохраняем лучшее значение после каждого поколения
            history.append(round(best_length, 2))

            # Отправляем обновление после каждого поколения
            await websocket.send_json({
                "type": "update",
                "route": best_route,
                "length": round(best_length, 2),
                "generation": current_gen,
                "history": history,
            })

            # Даём event loop возможность обработать другие задачи
            await asyncio.sleep(0)

        # Отправляем итоговый результат и полную историю
        await websocket.send_json({
            "type": "done",
            "route": best_route,
            "length": round(best_length, 2),
            "generation": generations,
            "history": history,
        })

    except WebSocketDisconnect:
        print("Клиент отключился от WebSocket")
