// Instructs React (Next.js) to run this code on the client side.
// Next.js by default would render this content on the server side where the application is hosted.
"use client";

import Pokemon from "@/model/pokemon"; // Ensure this path is correct
import { useEffect, useState } from "react";
import { Container, Image, Spinner} from "react-bootstrap";
import PokemonComponent from "./pokemon"; // Ensure this path is correct: e.g. "./PokemonComponent" or "@/components/PokemonComponent"
import PokeNavBar from "@/components/pokeNavBarComp"; // Ensure this path is correct

// Type for the props the Page component receives, reflecting params as a Promise
type PageOwnProps = {
  params: Promise<{ pokemon_id: string }>;
  // searchParams?: Promise<{ [key: string]: string | string[] | undefined }>; // Uncomment if you use searchParams
};

export default function PokemonPage({ params: paramsPromise }: PageOwnProps) {
  const [pokemonId, setPokemonId] = useState<string | null>(null); // Stores the resolved pokemon_id
  const [pokemon, setPokemon] = useState<Pokemon | undefined>(undefined);
  const [isLoadingPokemonId, setIsLoadingPokemonId] = useState(true); // Loading state for resolving the ID
  const [isLoadingPokemonData, setIsLoadingPokemonData] = useState(false); // Loading state for fetching Pokémon data

  // Effect to resolve pokemon_id from the paramsPromise
  useEffect(() => {
    let isActive = true;
    setIsLoadingPokemonId(true);

    paramsPromise
      .then((resolvedParams) => {
        if (isActive) {
          setPokemonId(resolvedParams.pokemon_id);
        }
      })
      .catch((error) => {
        console.error("Error resolving Pokemon ID from params:", error);
        if (isActive) {
          setPokemonId(null); // Indicate that ID resolution failed
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

  // Effect to fetch Pokemon data once pokemonId is resolved and available
  useEffect(() => {
    // Only proceed if ID resolution is complete and we have a valid pokemonId
    if (isLoadingPokemonId || !pokemonId) {
      // If ID is still loading, or if ID resolution finished but pokemonId is null (error)
      if (!isLoadingPokemonId && !pokemonId) {
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
        const resp = await fetch(`/api/pokemon/${pokemonId}`); // Assumes API route at /api/pokemon/[id]
        if (!isActive) return;

        if (resp.ok) {
          const pokemonData: Pokemon = await resp.json();
          setPokemon(pokemonData);
        } else {
          console.error(
            `Failed to fetch Pokémon: ${resp.status} ${resp.statusText}`
          );
          setPokemon(undefined);
        }
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
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
  }, [pokemonId, isLoadingPokemonId]); // Dependencies: re-run if pokemonId changes or ID loading state finishes

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

  // After ID resolution: if no pokemonId was found (e.g., promise rejected or no ID in params)
  if (!pokemonId) {
    return (
      <>
        <PokeNavBar />
        <Container className="text-center mt-5">
          <p>Could not determine the Pokémon ID.</p>
          <Image
            alt="error illustration"
            className="img-fluid mx-auto d-block rounded mt-3"
            style={{ maxWidth: "300px" }}
            src="https://cdn.dribbble.com/users/2805817/screenshots/13206178/media/6bd36939f8a01d4480cb1e08147e20f3.png" // Generic error/placeholder
          />
        </Container>
      </>
    );
  }

  // If pokemonId is available, but data is still loading
  if (isLoadingPokemonData) {
    return (
      <>
        <PokeNavBar />
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status" className="mb-2" />
          <p>Loading Pokémon data for ID: {pokemonId}...</p>
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
        // This case means loading finished, ID was present, but Pokémon data fetch failed or returned nothing
        <Container className="text-center mt-5">
          <p>
            Pokémon with ID &#39;{pokemonId}&#39; not found or an error occurred while
            fetching.
          </p>
          <Image
            alt={`Pokémon with ID ${pokemonId} not found`}
            className="img-fluid mx-auto d-block rounded mt-3"
            style={{ maxWidth: "300px" }}
            src="https://cdn.dribbble.com/users/2805817/screenshots/13206178/media/6bd36939f8a01d4480cb1e08147e20f3.png"
          />
        </Container>
      )}
    </>
  );
}
