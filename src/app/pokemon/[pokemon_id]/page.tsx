// Instructs React (Next.js) to run this code on the client side.
// Next.js by default would render this content on the server side where the application is hosted.
"use client";

import Pokemon from "@/model/pokemon"; // Ensure this path is correct and the Pokemon type expects an 'id: string' and other fields from your JSON
import { useEffect, useState } from "react";
import { Container, Image, Spinner } from "react-bootstrap"; // Assuming react-bootstrap is installed and configured
import PokemonComponent from "./pokemon"; // Ensure this path is correct: e.g. "./pokemonComponent" or "@/components/PokemonComponent"
import PokeNavBar from "@/components/pokeNavBarComp"; // Ensure this path is correct

// Define a type for the raw Pokemon data from JSON, if you have one.
// This should match the structure in pokemons.json. For example:
// type RawPokemonFromJson = {
//   pokemonName: string;
//   pokemonNumber: number; // This will be used as the source for 'id'
//   evolution: string;
//   evolutionFamily: string[];
//   mainImage: string;
//   defense: number;
//   speed: number;
//   pokemonType: string[];
//   attack: number;
//   healthPoints: number;
//   devolution: string;
//   // ... any other fields from your JSON structure
// };

// Type for the props the Page component receives, reflecting params as a Promise
type PageOwnProps = {
  params: Promise<{ pokemon_id: string }>; // pokemon_id here is expected to be pokemonNumber as a string
  // searchParams?: Promise<{ [key: string]: string | string[] | undefined }>; // Uncomment if you use searchParams
};

export default function PokemonPage({ params: paramsPromise }: PageOwnProps) {
  const [pokemonIdFromRoute, setPokemonIdFromRoute] = useState<string | null>(
    null
  ); // Stores the resolved pokemon_id (which is pokemonNumber as string)
  const [pokemon, setPokemon] = useState<Pokemon | undefined>(undefined);
  const [isLoadingPokemonId, setIsLoadingPokemonId] = useState(true); // Loading state for resolving the ID from route
  const [isLoadingPokemonData, setIsLoadingPokemonData] = useState(false); // Loading state for fetching Pokémon data

  // Effect to resolve pokemon_id from the paramsPromise
  useEffect(() => {
    let isActive = true;
    setIsLoadingPokemonId(true);

    paramsPromise
      .then((resolvedParams) => {
        if (isActive) {
          setPokemonIdFromRoute(resolvedParams.pokemon_id);
        }
      })
      .catch((error) => {
        console.error("Error resolving Pokemon ID from params:", error);
        if (isActive) {
          setPokemonIdFromRoute(null); // Indicate that ID resolution failed
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingPokemonId(false);
        }
      });

    return () => {
      isActive = false; // Cleanup function to prevent state updates on unmounted component
    };
  }, [paramsPromise]); // Dependency: re-run if the paramsPromise instance changes

  // Effect to fetch Pokemon data once pokemonIdFromRoute is resolved and available
  useEffect(() => {
    // Only proceed if ID resolution is complete and we have a valid pokemonIdFromRoute
    if (isLoadingPokemonId || !pokemonIdFromRoute) {
      if (!isLoadingPokemonId && !pokemonIdFromRoute) {
        // ID resolution finished, but no ID was found (error case)
        setPokemon(undefined);
        setIsLoadingPokemonData(false); // No data to load
      }
      return;
    }

    let isActive = true;
    setIsLoadingPokemonData(true);
    setPokemon(undefined); // Reset previous Pokémon data before new fetch

    const fetchData = async () => {
      try {
        const resp = await fetch(`/pokemons.json`); // Fetch from the local JSON

        if (!isActive) return;

        if (resp.ok) {
          // Assuming pokemons.json contains an array of raw Pokemon objects
          const allPokemonsRaw: Pokemon[] = await resp.json(); // Replace 'any' with RawPokemonFromJson if defined

          // Find the specific Pokémon by comparing pokemonIdFromRoute (string)
          // with pokemonNumber (number converted to string) from the JSON data.
          const foundRawPokemon = allPokemonsRaw.find(
            (p) => p.pokemonNumber.toString() === pokemonIdFromRoute
          );

          if (foundRawPokemon) {
            // Transform the found raw Pokémon object to include an 'id' field
            // and ensure it matches the 'Pokemon' type.
            const pokemonData: Pokemon = {
              ...foundRawPokemon, // Spread all properties from the raw object
              id: foundRawPokemon.pokemonNumber.toString(), // 'id' is the string version of pokemonNumber
              pokemonNumber: foundRawPokemon.pokemonNumber,
            };
            setPokemon(pokemonData);
          } else {
            console.warn(
              `Pokémon with number '${pokemonIdFromRoute}' not found in pokemons.json`
            );
            setPokemon(undefined); // Pokémon not found in the local data
          }
        } else {
          console.error(
            `Failed to fetch pokemons.json: ${resp.status} ${resp.statusText}`
          );
          setPokemon(undefined);
        }
      } catch (error) {
        console.error("Error fetching or processing pokemons.json:", error);
        if (isActive) {
          setPokemon(undefined);
        }
      } finally {
        if (isActive) {
          setIsLoadingPokemonData(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false; // Cleanup
    };
  }, [pokemonIdFromRoute, isLoadingPokemonId]); // Dependencies

  // Render logic based on loading states

  if (isLoadingPokemonId) {
    return (
      <>
        <PokeNavBar />
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status" className="mb-2" />
          <p>Loading Pokémon details...</p>
        </Container>
      </>
    );
  }

  // After ID resolution: if no pokemonIdFromRoute was found
  if (!pokemonIdFromRoute) {
    return (
      <>
        <PokeNavBar />
        <Container className="text-center mt-5">
          <p>Could not determine the Pokémon ID from the route.</p>
          <Image
            alt="error illustration"
            className="img-fluid mx-auto d-block rounded mt-3"
            style={{ maxWidth: "300px" }}
            src="https://cdn.dribbble.com/users/2805817/screenshots/13206178/media/6bd36939f8a01d4480cb1e08147e20f3.png"
            onError={(e) =>
              (e.currentTarget.src =
                "https://placehold.co/300x200/CCCCCC/FFFFFF?text=Error+Image")
            }
          />
        </Container>
      </>
    );
  }

  // If pokemonIdFromRoute is available, but data is still loading
  if (isLoadingPokemonData) {
    return (
      <>
        <PokeNavBar />
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status" className="mb-2" />
          <p>Loading Pokémon data for ID (number): {pokemonIdFromRoute}...</p>
        </Container>
      </>
    );
  }

  // Final display: Data loaded (or fetch attempt finished)
  return (
    <>
      <PokeNavBar />
      {pokemon ? (
        <PokemonComponent pokemon={pokemon} />
      ) : (
        <Container className="text-center mt-5">
          <p>
            Pokémon with ID (number) &#39;{pokemonIdFromRoute}&#39; not found or
            an error occurred while fetching from local data.
          </p>
          <Image
            alt={`Pokémon with ID ${pokemonIdFromRoute} not found`}
            className="img-fluid mx-auto d-block rounded mt-3"
            style={{ maxWidth: "300px" }}
            src="https://cdn.dribbble.com/users/2805817/screenshots/13206178/media/6bd36939f8a01d4480cb1e08147e20f3.png"
            onError={(e) =>
              (e.currentTarget.src =
                "https://placehold.co/300x200/CCCCCC/FFFFFF?text=Not+Found")
            }
          />
        </Container>
      )}
    </>
  );
}
