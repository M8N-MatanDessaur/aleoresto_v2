const axios = require("axios");

// Helper function to fetch restaurants based on user location and preferences
async function fetchRestaurants(location, radius, filters) {
  try {
    const query = filters?.keywords?.join(" ") || ""; // Combine keywords for query
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Define valid food establishment types
    const foodTypes = [
      'restaurant',
      'cafe',
      'bakery',
      'bar',
      'meal_takeaway',
      'meal_delivery'
    ].join('|');

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${foodTypes}&keyword=${query}&opennow=true&key=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.status !== "OK") {
      throw new Error(response.data.error_message || "Failed to fetch restaurants.");
    }

    // Additional filtering to ensure we only get food-related places
    const results = response.data.results.filter(place => {
      const types = place.types || [];
      // Exclude non-food establishments
      const excludedTypes = ['gas_station', 'convenience_store', 'grocery_store', 'supermarket', 'liquor_store'];
      const hasExcludedType = types.some(type => excludedTypes.includes(type));
      
      // Must have at least one food-related type
      const foodRelatedTypes = ['restaurant', 'cafe', 'bakery', 'bar', 'meal_takeaway', 'meal_delivery', 'food'];
      const hasFoodType = types.some(type => foodRelatedTypes.includes(type));
      
      return hasFoodType && !hasExcludedType;
    });

    return results;
  } catch (error) {
    console.error("Error fetching restaurants:", error.message);
    throw new Error("Failed to fetch restaurants. Please check your API key and parameters.");
  }
}

// Helper function to fetch detailed restaurant information
async function fetchRestaurantDetails(placeId, userLocation, transportMode) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,photos,price_level,rating,opening_hours,website,url,types,formatted_phone_number&key=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.status !== "OK") {
      throw new Error(`Google API error: ${response.data.status}`);
    }

    const result = response.data.result;

    return {
      name: result.name || "Unknown Name",
      address: result.formatted_address || "No Address Available",
      rating: result.rating || "No Rating Available",
      priceLevel: result.price_level || "Not Specified",
      photos: result.photos
        ? result.photos.map(
            (photo) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
          )
        : [],
      openingHours: result.opening_hours?.weekday_text || [],
      isOpen: result.opening_hours?.open_now || false,
      website: result.website || "No Website Available",
      googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${result.geometry?.location.lat},${result.geometry?.location.lng}`,
      types: result.types || [],
      location: result.geometry?.location || null,
      phoneNumber: result.formatted_phone_number || null,
    };
  } catch (error) {
    console.error("Error fetching restaurant details:", error.message);
    throw new Error("Failed to fetch restaurant details.");
  }
}

// Helper function to fetch itinerary details
async function fetchItinerary(userLocation, destinationLocation, transportMode) {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/directions/json`;
      const params = {
        origin: `${userLocation.lat},${userLocation.lng}`,
        destination: `${destinationLocation.lat},${destinationLocation.lng}`,
        mode: transportMode === 'no-limit' ? 'driving' : transportMode || "walking",
        key: apiKey,
      };
  
      const response = await axios.get(url, { params });
  
      if (response.data.status !== "OK") {
        throw new Error(response.data.error_message || "Failed to fetch itinerary.");
      }
  
      const route = response.data.routes[0];
      const leg = route.legs[0]; // Main leg of the journey
  
      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        steps: leg.steps.map((step) => ({
          instruction: step.html_instructions.replace(/<[^>]+>/g, ""), // Strip HTML tags
          distance: step.distance.text,
          duration: step.duration.text,
        })),
        googleMapsLink: `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${userLocation.lat},${userLocation.lng}&destination=${destinationLocation.lat},${destinationLocation.lng}&mode=${transportMode}`,
      };
    } catch (error) {
      console.error("Error fetching itinerary:", error.message);
      throw new Error("Failed to fetch itinerary.");
    }
  }
  

// Main handler function
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const { location, filters, transportMode } = JSON.parse(event.body);

    if (!location || !location.lat || !location.lng || !filters.radius) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid input. 'location' with 'lat' and 'lng' and 'radius' are required.",
        }),
      };
    }

    // Step 1: Fetch a list of restaurants
    const restaurants = await fetchRestaurants(location, filters.radius, filters);

    if (!restaurants || restaurants.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No restaurants found matching your preferences." }),
      };
    }

    // Filter restaurants based on price level
    const filteredRestaurants = restaurants.filter(restaurant => {
      // If no price_level is specified, include it in results
      if (typeof restaurant.price_level === 'undefined') return true;
      
      // If price filter is not set, include all restaurants
      if (!filters.price_range) return true;
      
      const [minPrice, maxPrice] = filters.price_range;
      
      // Include restaurant if its price level is less than or equal to the selected max price
      // This means if user selects $$$$, it will include $, $$, $$$, and $$$$
      return restaurant.price_level <= maxPrice;
    });

    if (filteredRestaurants.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No restaurants found matching your price range." }),
      };
    }

    // Step 2: Pick a random restaurant from filtered list
    const randomRestaurant = filteredRestaurants[Math.floor(Math.random() * filteredRestaurants.length)];

    if (!randomRestaurant.place_id) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Selected restaurant does not have a valid place_id." }),
      };
    }

    // Step 3: Fetch details of the random restaurant
    const restaurantDetails = await fetchRestaurantDetails(randomRestaurant.place_id, location, transportMode || "walking");

    // Step 4: Fetch itinerary details
    const itinerary = await fetchItinerary(
      location,
      restaurantDetails.location,
      transportMode || "walking"
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        restaurant: restaurantDetails,
        itinerary: itinerary,
      }),
    };
  } catch (error) {
    console.error("Error in handler:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
