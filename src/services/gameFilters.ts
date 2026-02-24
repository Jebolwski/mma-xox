import { Fighter } from "../interfaces/Fighter";
import Filters from "../logic/filters";

export const getFiltersHandler = async (
    filters: any,
    difficulty: string,
    setFilters: (value: any) => void,
    setPositionsFighters: (value: any) => void,
    setFiltersSelected: (value: any[]) => void,
): Promise<{ filters_arr: any[]; newPositions: any } | null> => {
    // Direkt Filters'dan difficulty'ye göre uygun filtreleri al
    const all = Filters();
    const activeFilters =
        difficulty === "EASY"
            ? all.easy
            : difficulty === "HARD"
                ? all.hard
                : all.medium;

    let isDone: boolean = false;
    let finish = 0;

    while (!isDone && finish < 1500) {
        finish += 1;
        const filters_arr: any = [];
        while (filters_arr.length < 6) {
            const random_index = Math.floor(Math.random() * activeFilters.length);
            if (!filters_arr.includes(activeFilters[random_index])) {
                filters_arr.push(activeFilters[random_index]);
            }
        }

        if (!filters_arr[3] || !filters_arr[4] || !filters_arr[5]) {
            console.error(
                "HATA: filters_arr[3], filters_arr[4] veya filters_arr[5] undefined!",
            );
            continue;
        }

        const newPositions: any = {
            position03: [],
            position04: [],
            position05: [],
            position13: [],
            position14: [],
            position15: [],
            position23: [],
            position24: [],
            position25: [],
        };

        for (let i = 0; i < 3; i++) {
            const a = filters_arr[i]?.filter_fighters || [];
            const b3 = filters_arr[3]?.filter_fighters || [];
            const b4 = filters_arr[4]?.filter_fighters || [];
            const b5 = filters_arr[5]?.filter_fighters || [];

            const intersection3 = a.filter((fighter1: Fighter) =>
                b3.some((fighter2: Fighter) => fighter1.Id === fighter2.Id),
            );
            const intersection4 = a.filter((fighter1: Fighter) =>
                b4.some((fighter2: Fighter) => fighter1.Id === fighter2.Id),
            );
            const intersection5 = a.filter((fighter1: Fighter) =>
                b5.some((fighter2: Fighter) => fighter1.Id === fighter2.Id),
            );

            if (
                intersection3.length < 3 ||
                intersection4.length < 3 ||
                intersection5.length < 3
            ) {
                break;
            }

            if (i === 0) {
                newPositions.position03 = intersection3;
                newPositions.position04 = intersection4;
                newPositions.position05 = intersection5;
            } else if (i === 1) {
                newPositions.position13 = intersection3;
                newPositions.position14 = intersection4;
                newPositions.position15 = intersection5;
            } else if (i === 2) {
                newPositions.position23 = intersection3;
                newPositions.position24 = intersection4;
                newPositions.position25 = intersection5;
            }

            if (i === 2) {
                isDone = true;
                break;
            }
        }

        if (isDone) {
            setPositionsFighters(newPositions);
            setFiltersSelected(filters_arr);
            return { filters_arr, newPositions };
        }
    }

    return null;
};
