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
    const { locations, vehicleCapacity, startLocation } = await request.json();
    
    // Simple genetic algorithm for route optimization
    const optimizedRoute = await optimizeRoute(locations, vehicleCapacity, startLocation, env);
    
    return new Response(JSON.stringify({
      success: true,
      optimizedRoute,
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
