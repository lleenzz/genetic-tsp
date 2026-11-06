import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from genetic_algorithm import generate_cities, route_length, init_population, select, crossover, swap_mutate

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

        raw_cities = generate_cities(n=n_cities, seed=seed)
        cities_list = [{"id": i, "x": c[0], "y": c[1]} for i, c in enumerate(raw_cities)]

        population = init_population(pop_size, len(raw_cities))
        best_route = min(population, key=lambda r: route_length(r, raw_cities))
        best_length = route_length(best_route, raw_cities)
        
        await websocket.send_json({
            "type": "init",
            "cities": cities_list,
            "route": best_route,
            "length": round(best_length, 2),
            "generation": 0
        })

        for gen in range(generations):
            population.sort(key=lambda r: route_length(r, raw_cities))
            new_pop = population[:elite_size]

            while len(new_pop) < pop_size:
                p1 = select(population, raw_cities, tournament_k)
                p2 = select(population, raw_cities, tournament_k)
                child = crossover(p1, p2)
                child = swap_mutate(child, mutation_rate)
                new_pop.append(child)

            population = new_pop

            gen_best = min(population, key=lambda r: route_length(r, raw_cities))
            gen_best_len = route_length(gen_best, raw_cities)

            if gen_best_len < best_length:
                best_length = gen_best_len
                best_route = gen_best

            current_gen = gen + 1

  
            if current_gen % 20 == 0 or current_gen == generations:
                await websocket.send_json({
                    "type": "update",
                    "route": best_route,
                    "length": round(best_length, 2),
                    "generation": current_gen
                })

                await asyncio.sleep(0.05)

        await websocket.send_json({
            "type": "done",
            "route": best_route,
            "length": round(best_length, 2),
            "generation": generations
        })

    except WebSocketDisconnect:
        print("Клиент отключился от WebSocket")