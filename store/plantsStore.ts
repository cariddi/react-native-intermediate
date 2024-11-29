import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PlantType = {
  id: string;
  name: string;
  wateringFrequencyDays: number;
  lastWateredAtTimestamp?: number;
  imageUri?: string;
};

type PlantsState = {
  nextId: number;
  plants: PlantType[];
  addPlant: (name: string, wateringFrequencyDays: number, imageUri?: string,) => void;
  removePlant: (plantId: string) => void;
  waterPlant: (plantId: string) => void;
};

export const usePlantStore = create(
  persist<PlantsState>(
    (set) => ({
      plants: [],
      nextId: 1,
            addPlant: async (
              name: string,
              wateringFrequencyDays: number,
              imageUri?: string,
            ) => {
              const savedImageUri =
                FileSystem.documentDirectory +
                `${new Date().getTime()}-${imageUri?.split("/").slice(-1)[0]}`;
    
              if (imageUri) {
                await FileSystem.copyAsync({
                  from: imageUri,
                  to: savedImageUri,
                });
              }
        return set((state) => {
          return {
            ...state,
            nextId: state.nextId + 1,
            plants: [
              ...state.plants,
              {
                id: String(state.nextId),
                name,
                wateringFrequencyDays,
                imageUri: imageUri ? savedImageUri : undefined,
              },
            ],
          };
        });
      },
      removePlant: (plantId: string) => {
        return set((state) => {
          return {
            ...state,
            plants: state.plants.filter((plant) => plant.id !== plantId),
          };
        });
      },
      waterPlant: (plantId: string) => {
        return set((state) => {
          return {
            ...state,
            plants: state.plants.map((plant) => {
              if (plant.id === plantId) {
                return {
                  ...plant,
                  lastWateredAtTimestamp: Date.now(),
                };
              }
              return plant;
            }),
          };
        });
      },
    }),
    {
      name: "plantly-plants-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);