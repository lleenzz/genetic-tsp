from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from genetic_algorithm import generate_cities, genetic_algorithm

app = FastAPI(title="TSP Genetic Algorithm API")

# Настройка CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GAParams(BaseModel):
    """Схема параметров для запуска генетического алгоритма."""
    n_cities: int = 25
    pop_size: int = 200
    generations: int = 200
    mutation_rate: float = 0.02
    elite_size: int = 10
    tournament_k: int = 5
    seed: int = 42


@app.post("/solve")
def solve_tsp(params: GAParams):
    """Запускает алгоритм оптимизации маршрута по заданным параметрам."""
    
    raw_cities = generate_cities(n=params.n_cities, seed=params.seed)
    cities_list = [{"id": i, "x": c[0], "y": c[1]} for i, c in enumerate(raw_cities)]

    
    best_route, best_length, history = genetic_algorithm(
        cities=raw_cities,
        pop_size=params.pop_size,
        generations=params.generations,
        mutation_rate=params.mutation_rate,
        elite_size=params.elite_size,
        tournament_k=params.tournament_k
    )

    
    return {
        "cities": cities_list,
        "best_route": best_route,
        "best_length": round(best_length, 2),
        "history": [round(h, 2) for h in history],
    }