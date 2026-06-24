import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  date: string;
  location?: string;
  memo?: string;
  taggedPeople: string[];
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
  deletePhoto: (id: string) => Promise<void>;
  addPerson: (name: string) => Person;
  updateUser: (update: Partial<UserProfile>) => Promise<void>;
  setCouple: (personId: string, startDate: string) => Promise<void>;
  unsetCouple: () => Promise<void>;
  getPhotosForPerson: (personId: string) => Photo[];
  getPersonById: (id: string) => Person | undefined;
  uniqueLocationCount: number;
}

const KEYS = {
  PHOTOS: "fourlink_photos_v1",
  PEOPLE: "fourlink_people_v1",
  USER: "fourlink_user_v1",
  SEEDED: "fourlink_seeded_v1",
};

const defaultUser: UserProfile = {
  nickname: "나",
  joinedAt: new Date().toISOString(),
};

const DEMO_PEOPLE: Person[] = [
  { id: "dp_1", name: "민수", photoCount: 12, lastPhotoDate: "2024-05-20" },
  { id: "dp_2", name: "지훈", photoCount: 7, lastPhotoDate: "2024-04-10" },
  {
    id: "dp_3",
    name: "여자친구",
    photoCount: 18,
    lastPhotoDate: "2024-05-20",
    isCouple: true,
    coupleStartDate: "2024-02-04",
  },
  { id: "dp_4", name: "수빈", photoCount: 3, lastPhotoDate: "2024-03-22" },
  { id: "dp_5", name: "철수", photoCount: 5, lastPhotoDate: "2024-05-02" },
];

const DEMO_PHOTOS: Photo[] = [
  {
    id: "photo_1",
    uri: "",
    date: "2024-05-20",
    location: "홍대 포토이즘",
    memo: "오늘 홍대에서 찍은 네컷!",
    taggedPeople: ["dp_1", "dp_2", "dp_3"],
    createdAt: "2024-05-20T10:00:00Z",
  },
  {
    id: "photo_2",
    uri: "",
    date: "2024-05-15",
    location: "만원 인생네컷",
    memo: "",
    taggedPeople: ["dp_3", "dp_4"],
    createdAt: "2024-05-15T14:00:00Z",
  },
  {
    id: "photo_3",
    uri: "",
    date: "2024-05-02",
    location: "인천대 축제",
    memo: "축제에서 찍은 기념 네컷",
    taggedPeople: ["dp_1", "dp_5"],
    createdAt: "2024-05-02T16:00:00Z",
  },
  {
    id: "photo_4",
    uri: "",
    date: "2024-04-10",
    location: "강남 하루필름",
    memo: "",
    taggedPeople: ["dp_2"],
    createdAt: "2024-04-10T13:00:00Z",
  },
  {
    id: "photo_5",
    uri: "",
    date: "2024-03-22",
    location: "신촌 포토시그니처",
    memo: "봄 나들이",
    taggedPeople: ["dp_3", "dp_4"],
    createdAt: "2024-03-22T11:00:00Z",
  },
];

const AppContext = createContext<AppContextType | null>(null);

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Start with demo data immediately so UI renders right away
  const [photos, setPhotos] = useState<Photo[]>(DEMO_PHOTOS);
  const [people, setPeople] = useState<Person[]>(DEMO_PEOPLE);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoaded, setIsLoaded] = useState(true);

  // Hydrate from AsyncStorage after initial render
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
        if (!seeded) {
          // First launch - persist demo data
          await Promise.all([
            AsyncStorage.setItem(KEYS.PHOTOS, JSON.stringify(DEMO_PHOTOS)),
            AsyncStorage.setItem(KEYS.PEOPLE, JSON.stringify(DEMO_PEOPLE)),
            AsyncStorage.setItem(KEYS.SEEDED, "1"),
          ]);
        } else {
          // Returning user - load saved data
          const [p, pe, u] = await Promise.all([
            AsyncStorage.getItem(KEYS.PHOTOS),
            AsyncStorage.getItem(KEYS.PEOPLE),
            AsyncStorage.getItem(KEYS.USER),
          ]);
          if (cancelled) return;
          if (p) setPhotos(JSON.parse(p));
          if (pe) setPeople(JSON.parse(pe));
          if (u) setUser(JSON.parse(u));
        }
      } catch {
        // Keep demo data on error
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const savePhotos = (arr: Photo[]) =>
    AsyncStorage.setItem(KEYS.PHOTOS, JSON.stringify(arr)).catch(() => {});
  const savePeople = (arr: Person[]) =>
    AsyncStorage.setItem(KEYS.PEOPLE, JSON.stringify(arr)).catch(() => {});

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
            ? { ...p, photoCount: p.photoCount + 1, lastPhotoDate: photoData.date }
            : p
        );
        savePeople(updated);
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
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            return { ...person, photoCount: count, lastPhotoDate: last?.date };
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
      AsyncStorage.setItem(KEYS.USER, JSON.stringify(updated)).catch(() => {});
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

  const uniqueLocationCount = new Set(
    photos.map((p) => p.location).filter(Boolean)
  ).size;

  return (
    <AppContext.Provider
      value={{
        user, photos, people, isLoaded,
        addPhoto, deletePhoto, addPerson, updateUser,
        setCouple, unsetCouple, getPhotosForPerson, getPersonById,
        uniqueLocationCount,
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
