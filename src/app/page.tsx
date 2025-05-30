// Instructs React (Next.js) to run this code on the client side.
"use client";

import PokemonsComp from "@/components/pokemonsComp"; // Ensure this path is correct
import PokeNavBar from "@/components/pokeNavBarComp"; // Ensure this path is correct
import PokemonCard from "@/model/pokemonCard"; // Ensure this path is correct and PokemonCard type expects an 'id: string'
import { useEffect, useState } from "react";
import { Container, Row, Spinner } from "react-bootstrap"; // Assuming react-bootstrap is installed

// Define a type for the raw Pokemon data coming from JSON, if known,
// otherwise 'any' will be used implicitly during the map.
// For example:
// type RawPokemonData = {
//   pokemonName: string;
//   pokemonNumber: number;
//   mainImage: string;
//   // ... other fields from your JSON
// };

export default function Home() {
  const [pokemons, setPokemons] = useState<PokemonCard[] | undefined>(
    undefined
  ); // Initialize with undefined to better handle loading state
  const [isLoading, setIsLoading] = useState(true); // State to manage loading
  const [error, setError] = useState<string | null>(null); // State to manage errors

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading to true when fetching starts
      setError(null); // Reset error state
      try {
        // Fetch the list of Pokémon from the local JSON file
        // This file should be in your `public` directory (e.g., public/pokemons.json)
        const resp = await fetch("/pokemons.json");

        if (resp.ok) {
          // Assuming pokemons.json directly contains an array of Pokemon objects.
          const rawPokemonsArray: any[] = await resp.json(); // Or use RawPokemonData[] if defined

          // Map the raw data to PokemonCard[], adding the 'id' field from 'pokemonNumber'
          const pokemonsData: PokemonCard[] = rawPokemonsArray.map((p) => ({
            ...p, // Spread all original properties from the JSON object
            id: p.pokemonNumber.toString(), // Create the 'id' property from 'pokemonNumber'
          }));

          setPokemons(pokemonsData);
        } else {
          // Handle HTTP errors (e.g., 404 Not Found)
          console.error(
            `Failed to fetch pokemons.json: ${resp.status} ${resp.statusText}`
          );
          setError(`Failed to load Pokémon data: ${resp.statusText}`);
          setPokemons([]); // Set to empty array
        }
      } catch (e) {
        // Handle network errors or errors during JSON parsing
        console.error("Error fetching or processing pokemons.json:", e);
        if (e instanceof Error) {
          setError(
            `An error occurred while loading Pokémon data: ${e.message}`
          );
        } else {
          setError("An unknown error occurred while loading Pokémon data.");
        }
        setPokemons([]); // Set to empty array
      } finally {
        setIsLoading(false); // Set loading to false once fetching is complete (success or failure)
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on component mount

  // Render logic based on loading and error states
  if (isLoading) {
    return (
      <>
        <PokeNavBar />
        <Container className="text-center mt-5">
          <Row className="justify-content-md-center p-2">
            <Spinner className="p-2" animation="border" role="status" />
          </Row>
          <Row className="justify-content-md-center p-2">
            Loading Pokémons...
          </Row>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PokeNavBar />
        <Container className="text-center mt-5">
          <p>{error}</p>
          {/* You could add a retry button or more specific error UI here */}
        </Container>
      </>
    );
  }

  return (
    <>
      <PokeNavBar />
      {/* Ensure PokemonsComp can handle an empty array if that's a possibility */}
      {pokemons && pokemons.length > 0 ? (
        <PokemonsComp pokemons={pokemons} />
      ) : (
        <Container className="text-center mt-5">
          <p>
            No Pokémon found. Check if the `pokemons.json` file is correctly
            placed in the `public` folder and is not empty.
          </p>
        </Container>
      )}
    </>
  );
}
