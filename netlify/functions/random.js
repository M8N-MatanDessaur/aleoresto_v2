const axios = require("axios");

// Helper function to fetch restaurants based on user location and preferences
async function fetchRestaurants(location, radius, filters) {
  try {
    const query = filters?.keywords?.join(" ") || ""; // Combine keywords for query
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=restaurant&keyword=${query}&key=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.status !== "OK") {
      throw new Error(response.data.error_message || "Failed to fetch restaurants.");
    }

    return response.data.results; // Return the list of restaurants
  } catch (error) {
    console.error("Error fetching restaurants:", error.message);
    throw new Error("Failed to fetch restaurants. Please check your API key and parameters.");
  }
}

// Helper function to fetch detailed restaurant information
async function fetchRestaurantDetails(placeId) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,photos,price_level,rating,opening_hours,website,url,types&key=${apiKey}`;
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
      website: result.website || "No Website Available",
      googleMapsUrl: result.url || "No URL Available",
      types: result.types || [],
      location: result.geometry?.location || null,
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
        mode: transportMode || "walking",
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

    // Step 2: Pick a random restaurant
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

    if (!randomRestaurant.place_id) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Selected restaurant does not have a valid place_id." }),
      };
    }

    // Step 3: Fetch details of the random restaurant
    const restaurantDetails = await fetchRestaurantDetails(randomRestaurant.place_id);

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
