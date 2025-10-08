export interface Env {
  GOOGLE_MAPS_API_KEY: string;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
  priority: number;
}

interface OptimizedRoute {
  sequence: number[];
  totalDistance: number;
  estimatedTime: number;
  fuelCost: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (request.method === 'POST' && url.pathname === '/optimize-route') {
      return handleRouteOptimization(request, env);
    }
    
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('SSDP Route Optimizer Worker - Ready', { status: 200 });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};

async function handleRouteOptimization(request: Request, env: Env): Promise<Response> {
  try {
    const { locations, vehicleCapacity, startLocation, algorithm } = await request.json();
    
    // Choose optimization algorithm
    let optimizedRoute: OptimizedRoute;
    
    if (algorithm === 'genetic') {
      optimizedRoute = await optimizeRouteGenetic(locations, vehicleCapacity, startLocation, env);
    } else if (algorithm === 'simulated-annealing') {
      optimizedRoute = await optimizeRouteSimulatedAnnealing(locations, vehicleCapacity, startLocation, env);
    } else {
      // Default to nearest neighbor (fast)
      optimizedRoute = await optimizeRoute(locations, vehicleCapacity, startLocation, env);
    }
    
    return new Response(JSON.stringify({
      success: true,
      optimizedRoute,
      algorithm: algorithm || 'nearest-neighbor',
      generatedAt: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function optimizeRoute(
  locations: Location[], 
  vehicleCapacity: number, 
  startLocation: Location,
  env: Env
): Promise<OptimizedRoute> {
  // Simplified route optimization using nearest neighbor heuristic
  // In production, use more sophisticated algorithms like Genetic Algorithm or Simulated Annealing
  
  const unvisited = [...locations];
  const route: number[] = [];
  let currentLocation = startLocation;
  let totalDistance = 0;
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(currentLocation, unvisited[i]);
      // Consider priority (higher priority = lower effective distance)
      const effectiveDistance = distance / (unvisited[i].priority || 1);
      
      if (effectiveDistance < nearestDistance) {
        nearestDistance = effectiveDistance;
        nearestIndex = i;
      }
    }
    
    const nextLocation = unvisited[nearestIndex];
    route.push(locations.indexOf(nextLocation));
    totalDistance += calculateDistance(currentLocation, nextLocation);
    currentLocation = nextLocation;
    unvisited.splice(nearestIndex, 1);
  }
  
  // Add return to start
  totalDistance += calculateDistance(currentLocation, startLocation);
  
  return {
    sequence: route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime: Math.round((totalDistance / 50) * 60), // Assuming 50 km/h average speed
    fuelCost: Math.round(totalDistance * 0.5 * 100) / 100 // Assuming 0.5 SAR per km
  };
}

function calculateDistance(loc1: Location, loc2: Location): number {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * BRAINSAIT: Genetic Algorithm for route optimization
 * Uses population-based optimization with crossover and mutation
 */
async function optimizeRouteGenetic(
  locations: Location[],
  vehicleCapacity: number,
  startLocation: Location,
  env: Env
): Promise<OptimizedRoute> {
  const POPULATION_SIZE = 50;
  const GENERATIONS = 100;
  const MUTATION_RATE = 0.1;
  const ELITE_SIZE = 5;
  
  // Generate initial population
  let population: number[][] = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const route = Array.from({ length: locations.length }, (_, idx) => idx);
    // Shuffle route
    for (let j = route.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [route[j], route[k]] = [route[k], route[j]];
    }
    population.push(route);
  }
  
  // Evolve population
  for (let gen = 0; gen < GENERATIONS; gen++) {
    // Evaluate fitness (lower distance is better)
    const fitness = population.map(route => ({
      route,
      distance: calculateRouteDistance(route, locations, startLocation)
    }));
    
    // Sort by fitness
    fitness.sort((a, b) => a.distance - b.distance);
    
    // Keep elite
    const newPopulation = fitness.slice(0, ELITE_SIZE).map(f => f.route);
    
    // Crossover and mutation
    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = fitness[Math.floor(Math.random() * ELITE_SIZE * 2)].route;
      const parent2 = fitness[Math.floor(Math.random() * ELITE_SIZE * 2)].route;
      
      let child = crossover(parent1, parent2);
      
      if (Math.random() < MUTATION_RATE) {
        child = mutate(child);
      }
      
      newPopulation.push(child);
    }
    
    population = newPopulation;
  }
  
  // Get best route
  const bestRoute = population.reduce((best, route) => {
    const distance = calculateRouteDistance(route, locations, startLocation);
    const bestDistance = calculateRouteDistance(best, locations, startLocation);
    return distance < bestDistance ? route : best;
  });
  
  const totalDistance = calculateRouteDistance(bestRoute, locations, startLocation);
  
  return {
    sequence: bestRoute,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime: Math.round((totalDistance / 50) * 60),
    fuelCost: Math.round(totalDistance * 0.5 * 100) / 100
  };
}

/**
 * BRAINSAIT: Simulated Annealing for route optimization
 * Uses probabilistic hill climbing to escape local optima
 */
async function optimizeRouteSimulatedAnnealing(
  locations: Location[],
  vehicleCapacity: number,
  startLocation: Location,
  env: Env
): Promise<OptimizedRoute> {
  const INITIAL_TEMP = 10000;
  const COOLING_RATE = 0.003;
  const ITERATIONS_PER_TEMP = 100;
  
  // Start with random route
  let currentRoute = Array.from({ length: locations.length }, (_, idx) => idx);
  for (let i = currentRoute.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentRoute[i], currentRoute[j]] = [currentRoute[j], currentRoute[i]];
  }
  
  let currentDistance = calculateRouteDistance(currentRoute, locations, startLocation);
  let bestRoute = [...currentRoute];
  let bestDistance = currentDistance;
  
  let temperature = INITIAL_TEMP;
  
  while (temperature > 1) {
    for (let iter = 0; iter < ITERATIONS_PER_TEMP; iter++) {
      // Generate neighbor solution by swapping two random cities
      const newRoute = [...currentRoute];
      const i = Math.floor(Math.random() * newRoute.length);
      const j = Math.floor(Math.random() * newRoute.length);
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      
      const newDistance = calculateRouteDistance(newRoute, locations, startLocation);
      
      // Accept better solutions or worse solutions with probability
      const delta = newDistance - currentDistance;
      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        currentRoute = newRoute;
        currentDistance = newDistance;
        
        if (currentDistance < bestDistance) {
          bestRoute = [...currentRoute];
          bestDistance = currentDistance;
        }
      }
    }
    
    temperature *= (1 - COOLING_RATE);
  }
  
  return {
    sequence: bestRoute,
    totalDistance: Math.round(bestDistance * 100) / 100,
    estimatedTime: Math.round((bestDistance / 50) * 60),
    fuelCost: Math.round(bestDistance * 0.5 * 100) / 100
  };
}

function calculateRouteDistance(route: number[], locations: Location[], startLocation: Location): number {
  let totalDistance = 0;
  let currentLoc = startLocation;
  
  for (const idx of route) {
    const nextLoc = locations[idx];
    totalDistance += calculateDistance(currentLoc, nextLoc);
    currentLoc = nextLoc;
  }
  
  // Return to start
  totalDistance += calculateDistance(currentLoc, startLocation);
  
  return totalDistance;
}

function crossover(parent1: number[], parent2: number[]): number[] {
  const start = Math.floor(Math.random() * parent1.length);
  const end = Math.floor(Math.random() * (parent1.length - start)) + start;
  
  const child = Array(parent1.length).fill(-1);
  
  // Copy segment from parent1
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }
  
  // Fill remaining from parent2
  let childIdx = 0;
  for (let i = 0; i < parent2.length; i++) {
    if (!child.includes(parent2[i])) {
      while (child[childIdx] !== -1) {
        childIdx++;
      }
      child[childIdx] = parent2[i];
    }
  }
  
  return child;
}

function mutate(route: number[]): number[] {
  const mutated = [...route];
  const i = Math.floor(Math.random() * mutated.length);
  const j = Math.floor(Math.random() * mutated.length);
  [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
  return mutated;
}
