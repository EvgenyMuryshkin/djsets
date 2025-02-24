import { IDJSets } from "./Model";
import { v4 as uuidv4 } from 'uuid';

const storageKey = "DSSets";

export class StorageService {

    static async Load(): Promise<IDJSets> {
        const value = localStorage.getItem(storageKey);
        try {
            if (value) {
                const sets = JSON.parse(value) as IDJSets;

                sets.sets.forEach(s => {
                    if (!s.id) s.id = uuidv4();
                    if (!s.listenDate) s.listenDate = new Date().toISOString();
                    if (!s.channel) s.channel = "";
                })

                return sets;
            }
        }
        catch {}

        return { version: 1, sets: [] };
    }

    static async Save(model: IDJSets) {
        if (!model) {
            localStorage.removeItem(storageKey);
        }
        else {
            const value = JSON.stringify(model);
            localStorage.setItem(storageKey, value);
        }
    }
}