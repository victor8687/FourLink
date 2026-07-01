import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Person {
  id: string;
  name: string;
  photoCount: number;
  lastPhotoDate?: string;
  isCouple?: boolean;
  coupleStartDate?: string;
}

export interface Photo {
  id: string;
  uri: string;
  taggedPeople: string[];
  favorite?: boolean;
  createdAt: string;
}

export interface UserProfile {
  nickname: string;
  joinedAt: string;
}

interface AppContextType {
  user: UserProfile;
  photos: Photo[];
  people: Person[];
  isLoaded: boolean;
  addPhoto: (photo: Omit<Photo, "id" | "createdAt">) => Promise<void>;
  addPhotos: (photos: Omit<Photo, "id" | "createdAt">[]) => Promise<void>;
  updatePhoto: (id: string, update: Partial<Photo>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  addPerson: (name: string) => Person;
  updateUser: (update: Partial<UserProfile>) => Promise<void>;
  setCouple: (personId: string, startDate: string) => Promise<void>;
  unsetCouple: () => Promise<void>;
  getPhotosForPerson: (personId: string) => Photo[];
  getPersonById: (id: string) => Person | undefined;
}

const KEYS = {
  PHOTOS: "fourlink_photos_v1",
  PEOPLE: "fourlink_people_v1",
  USER: "fourlink_user_v1",
};

const defaultUser: UserProfile = {
  nickname: "나",
  joinedAt: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | null>(null);

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Start with demo data immediately so UI renders right away
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from AsyncStorage after initial render
  useEffect(() => {
    (async () => {
      try {
        const [p, pe, u] = await Promise.all([
          AsyncStorage.getItem(KEYS.PHOTOS),
          AsyncStorage.getItem(KEYS.PEOPLE),
          AsyncStorage.getItem(KEYS.USER),
        ]);

        if (p) setPhotos(JSON.parse(p));
        if (pe) setPeople(JSON.parse(pe));
        if (u) setUser(JSON.parse(u));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const savePhotos = (arr: Photo[]) =>
    AsyncStorage.setItem(KEYS.PHOTOS, JSON.stringify(arr)).catch(() => { });
  const savePeople = (arr: Person[]) =>
    AsyncStorage.setItem(KEYS.PEOPLE, JSON.stringify(arr)).catch(() => { });

  const addPhoto = useCallback(
    async (photoData: Omit<Photo, "id" | "createdAt">) => {
      const newPhoto: Photo = {
        ...photoData,
        id: genId(),
        createdAt: new Date().toISOString(),
      };
      setPhotos((prev) => {
        const updated = [newPhoto, ...prev];
        savePhotos(updated);
        return updated;
      });
      setPeople((prev) => {
        const updated = prev.map((p) =>
          photoData.taggedPeople.includes(p.id)
            ? {
              ...p,
              photoCount: p.photoCount + 1,
              lastPhotoDate: new Date().toISOString(),
            }
            : p
        );

        savePeople(updated);
        return updated;
      });
    },
    []
  );

  const addPhotos = useCallback(
    async (photosData: Omit<Photo, "id" | "createdAt">[]) => {
      const newPhotos: Photo[] = photosData.map((photo) => ({
        ...photo,
        id: genId(),
        createdAt: new Date().toISOString(),
      }));

      setPhotos((prev) => {
        const updated = [...newPhotos, ...prev];
        savePhotos(updated);
        return updated;
      });

      setPeople((prev) => {
        const updated = [...prev];

        newPhotos.forEach((photo) => {
          photo.taggedPeople.forEach((personId) => {
            const index = updated.findIndex((p) => p.id === personId);

            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                photoCount: updated[index].photoCount + 1,
                lastPhotoDate: new Date().toISOString(),
              };
            }
          });
        });

        savePeople(updated);
        return updated;
      });
    },
    []
  );

  const updatePhoto = useCallback(
    async (id: string, update: Partial<Photo>) => {
      setPhotos((prev) => {
        const updated = prev.map((photo) =>
          photo.id === id
            ? { ...photo, ...update }
            : photo
        );

        savePhotos(updated);
        return updated;
      });
    },
    []
  );

  const deletePhoto = useCallback(
    async (id: string) => {
      setPhotos((prevPhotos) => {
        const photo = prevPhotos.find((p) => p.id === id);
        if (!photo) return prevPhotos;
        const updated = prevPhotos.filter((p) => p.id !== id);
        savePhotos(updated);
        setPeople((prevPeople) => {
          const updatedPeople = prevPeople.map((person) => {
            if (!photo.taggedPeople.includes(person.id)) return person;
            const count = updated.filter((p) => p.taggedPeople.includes(person.id)).length;
            const last = updated
              .filter((p) => p.taggedPeople.includes(person.id))
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0];

            return {
              ...person,
              photoCount: count,
              lastPhotoDate: last?.createdAt,
            };
          });
          savePeople(updatedPeople);
          return updatedPeople;
        });
        return updated;
      });
    },
    []
  );

  const addPerson = useCallback((name: string): Person => {
    let result: Person | null = null;
    setPeople((prev) => {
      const existing = prev.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        result = existing;
        return prev;
      }
      const newPerson: Person = { id: genId(), name, photoCount: 0 };
      result = newPerson;
      const updated = [...prev, newPerson];
      savePeople(updated);
      return updated;
    });
    return result ?? { id: genId(), name, photoCount: 0 };
  }, []);

  const updateUser = useCallback(async (update: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...update };
      AsyncStorage.setItem(KEYS.USER, JSON.stringify(updated)).catch(() => { });
      return updated;
    });
  }, []);

  const setCouple = useCallback(async (personId: string, startDate: string) => {
    setPeople((prev) => {
      const updated = prev.map((p) => ({
        ...p,
        isCouple: p.id === personId,
        coupleStartDate: p.id === personId ? startDate : undefined,
      }));
      savePeople(updated);
      return updated;
    });
  }, []);

  const unsetCouple = useCallback(async () => {
    setPeople((prev) => {
      const updated = prev.map((p) => ({ ...p, isCouple: false, coupleStartDate: undefined }));
      savePeople(updated);
      return updated;
    });
  }, []);

  const getPhotosForPerson = useCallback(
    (personId: string) => photos.filter((p) => p.taggedPeople.includes(personId)),
    [photos]
  );

  const getPersonById = useCallback(
    (id: string) => people.find((p) => p.id === id),
    [people]
  );

  return (
    <AppContext.Provider
      value={{
        user, photos, people, isLoaded,
        addPhoto, addPhotos, deletePhoto, addPerson, updatePhoto, updateUser,
        setCouple, unsetCouple, getPhotosForPerson, getPersonById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
