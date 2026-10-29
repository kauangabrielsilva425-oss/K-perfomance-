import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  UserProfile,
  WorkoutRoutine,
  WorkoutSession,
  WorkoutHistoryEntry,
  ActiveWorkoutState,
  ExerciseSetLog,
  FoodItem,
  DayMealPlan,
  ShoppingItem,
  HabitItem,
  MealFoodEntry,
  CalendarWorkout,
  BodyMeasurementEntry,
  ProgressPhoto,
} from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import {
  INITIAL_USER_PROFILE,
  INITIAL_ROUTINES,
  EXERCISE_DATABASE,
  INITIAL_FOOD_DATABASE,
  INITIAL_MEAL_PLAN,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_HABITS,
  INITIAL_WORKOUT_HISTORY,
  INITIAL_CALENDAR_WORKOUTS,
  INITIAL_BODY_MEASUREMENTS,
} from '../data/initialData';

export type AppTab =
  | 'home'
  | 'desempenho'
  | 'rotina'
  | 'treino_vivo'
  | 'alimentacao'
  | 'nutricao_guia'
  | 'catalogo'
  | 'compras'
  | 'suplementacao'
  | 'evolucao'
  | 'calendario';

interface AppContextType {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  routines: WorkoutRoutine[];
  activeRoutine: WorkoutRoutine;
  setActiveRoutineId: (routineId: string) => void;
  saveCustomRoutine: (routine: WorkoutRoutine) => void;
  generateSuggestedRoutine: (params: {
    days: number;
    experience: string;
    goal: string;
    time: number;
    equipment: string;
  }) => WorkoutRoutine;
  activeWorkout: ActiveWorkoutState | null;
  startWorkout: (session: WorkoutSession, routineId?: string) => void;
  updateActiveWorkout: (updater: (prev: ActiveWorkoutState) => ActiveWorkoutState) => void;
  finishWorkout: (perceivedRecovery?: number, notes?: string) => void;
  cancelWorkout: () => void;
  workoutHistory: WorkoutHistoryEntry[];
  deleteWorkoutHistoryItem: (id: string) => void;
  mealPlan: DayMealPlan[];
  addFoodToMeal: (day: DayMealPlan['dayOfWeek'], mealType: string, food: FoodItem, grams: number) => void;
  removeFoodFromMeal: (day: DayMealPlan['dayOfWeek'], mealType: string, entryId: string) => void;
  updateMealFoodGrams: (day: DayMealPlan['dayOfWeek'], mealType: string, entryId: string, grams: number) => void;
  duplicateMealsToDay: (fromDay: DayMealPlan['dayOfWeek'], toDay: DayMealPlan['dayOfWeek']) => void;
  foodDatabase: FoodItem[];
  favoriteFoodIds: string[];
  toggleFavoriteFood: (foodId: string) => void;
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  deleteShoppingItem: (id: string) => void;
  clearBoughtItems: () => void;
  generateShoppingListFromMealPlan: () => void;
  habits: HabitItem[];
  toggleHabit: (id: string) => void;
  resetDailyHabits: () => void;
  // Calendar Workouts
  calendarWorkouts: CalendarWorkout[];
  addCalendarWorkout: (workout: CalendarWorkout) => void;
  updateCalendarWorkout: (workout: CalendarWorkout) => void;
  toggleCalendarWorkoutStatus: (id: string) => void;
  deleteCalendarWorkout: (id: string) => void;
  // Evolution & Body Measurements
  bodyMeasurements: BodyMeasurementEntry[];
  addBodyMeasurement: (entry: Omit<BodyMeasurementEntry, 'id'>) => void;
  deleteBodyMeasurement: (id: string) => void;
  // Progress Photos
  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  deleteProgressPhoto: (id: string) => void;
  playTimerBeep: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  isCloudSyncing: boolean;
  lastSyncedAt: Date | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'kperf_profile',
  ROUTINES: 'kperf_routines',
  ACTIVE_WORKOUT: 'kperf_active_workout',
  HISTORY: 'kperf_workout_history',
  MEALS: 'kperf_meal_plan',
  SHOPPING: 'kperf_shopping',
  HABITS: 'kperf_habits',
  FAVORITES: 'kperf_favorite_foods',
  CALENDAR: 'kperf_calendar_workouts',
  MEASUREMENTS: 'kperf_body_measurements',
  PHOTOS: 'kperf_progress_photos',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<AppTab>('home');

  // 1. Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // 2. Routines State
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  // 3. Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 4. Workout History State
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_WORKOUT_HISTORY;
    } catch {
      return INITIAL_WORKOUT_HISTORY;
    }
  });

  // 5. Meal Plan State
  const [mealPlan, setMealPlan] = useState<DayMealPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEALS);
      return saved ? JSON.parse(saved) : INITIAL_MEAL_PLAN;
    } catch {
      return INITIAL_MEAL_PLAN;
    }
  });

  // 6. Shopping List State
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      return saved ? JSON.parse(saved) : INITIAL_SHOPPING_ITEMS;
    } catch {
      return INITIAL_SHOPPING_ITEMS;
    }
  });

  // 7. Habits State
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
      return saved ? JSON.parse(saved) : INITIAL_HABITS;
    } catch {
      return INITIAL_HABITS;
    }
  });

  // 8. Favorite Food IDs
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : ['food_peito_frango_cru', 'food_ovos_inteiros', 'food_arroz_branco_cozido', 'food_aveia_flocos', 'food_banana_prata', 'food_azeite_oliva', 'food_whey_isolado'];
    } catch {
      return ['food_peito_frango_cru', 'food_ovos_inteiros', 'food_arroz_branco_cozido', 'food_aveia_flocos'];
    }
  });

  // 9. Calendar Workouts
  const [calendarWorkouts, setCalendarWorkouts] = useState<CalendarWorkout[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      return saved ? JSON.parse(saved) : INITIAL_CALENDAR_WORKOUTS;
    } catch {
      return INITIAL_CALENDAR_WORKOUTS;
    }
  });

  // 10. Body Measurements
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurementEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
      return saved ? JSON.parse(saved) : INITIAL_BODY_MEASUREMENTS;
    } catch {
      return INITIAL_BODY_MEASUREMENTS;
    }
  });

  // 11. Progress Photos
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHOTOS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    }
  }, [activeWorkout]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteFoodIds));
  }, [favoriteFoodIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendarWorkouts));
  }, [calendarWorkouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(bodyMeasurements));
  }, [bodyMeasurements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(progressPhotos));
  }, [progressPhotos]);

  // Firestore Cloud Synchronization per Authenticated User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [hasHydratedFromCloud, setHasHydratedFromCloud] = useState<boolean>(false);

  // Listen to auth user state to trigger hydration
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setHasHydratedFromCloud(false);
        return;
      }

      // Hydrate user's private data from Firestore
      try {
        setIsCloudSyncing(true);
        const userDocRef = doc(db, 'users', user.uid, 'userData', 'current');
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const cloudData = snap.data();
          if (cloudData.profile) setUserProfile(cloudData.profile);
          if (cloudData.routines) setRoutines(cloudData.routines);
          if (cloudData.workoutHistory) setWorkoutHistory(cloudData.workoutHistory);
          if (cloudData.mealPlan) setMealPlan(cloudData.mealPlan);
          if (cloudData.shoppingList) setShoppingList(cloudData.shoppingList);
          if (cloudData.habits) setHabits(cloudData.habits);
          if (cloudData.favorites) setFavoriteFoodIds(cloudData.favorites);
          if (cloudData.calendar) setCalendarWorkouts(cloudData.calendar);
          if (cloudData.measurements) setBodyMeasurements(cloudData.measurements);
          if (cloudData.photos) setProgressPhotos(cloudData.photos);
          setLastSyncedAt(new Date());
        }
      } catch (err) {
        console.warn('Could not load user data from cloud:', err);
      } finally {
        setIsCloudSyncing(false);
        setHasHydratedFromCloud(true);
      }
    });

    return () => unsub();
  }, []);

  // Debounced cloud persistence on state changes when user is logged in
  useEffect(() => {
    if (!currentUser || !hasHydratedFromCloud) return;

    const timer = setTimeout(async () => {
      try {
        setIsCloudSyncing(true);
        const userDocRef = doc(db, 'users', currentUser.uid, 'userData', 'current');
        await setDoc(userDocRef, {
          userId: currentUser.uid,
          profile: userProfile,
          routines,
          workoutHistory,
          mealPlan,
          shoppingList,
          habits,
          favorites: favoriteFoodIds,
          calendar: calendarWorkouts,
          measurements: bodyMeasurements,
          photos: progressPhotos,
          updatedAt: new Date().toISOString(),
        });
        setLastSyncedAt(new Date());
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/userData/current`);
      } finally {
        setIsCloudSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    currentUser,
    hasHydratedFromCloud,
    userProfile,
    routines,
    workoutHistory,
    mealPlan,
    shoppingList,
    habits,
    favoriteFoodIds,
    calendarWorkouts,
    bodyMeasurements,
    progressPhotos,
  ]);

  // Audio Beep for Gym Rest Timer
  const playTimerBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Audio might be muted by browser policy before first interaction
    }
  }, []);

  // Timer Tick Interval for Active Workout
  useEffect(() => {
    if (!activeWorkout || activeWorkout.isPaused) return;

    const interval = setInterval(() => {
      setActiveWorkout((prev) => {
        if (!prev || prev.isPaused) return prev;

        let nextRestActive = prev.isRestActive;
        let nextRestRemaining = prev.restSecondsRemaining;

        if (prev.isRestActive) {
          if (prev.restSecondsRemaining <= 1) {
            nextRestActive = false;
            nextRestRemaining = 0;
            playTimerBeep();
          } else {
            nextRestRemaining = prev.restSecondsRemaining - 1;
          }
        }

        return {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
          isRestActive: nextRestActive,
          restSecondsRemaining: nextRestRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.isPaused, activeWorkout?.isRestActive, playTimerBeep]);

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  const activeRoutine = routines.find((r) => r.isCurrentActive) || routines[0];

  const setActiveRoutineId = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => ({
        ...r,
        isCurrentActive: r.id === id,
      }))
    );
  };

  const saveCustomRoutine = (newRoutine: WorkoutRoutine) => {
    setRoutines((prev) => {
      const exists = prev.findIndex((r) => r.id === newRoutine.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = newRoutine;
        return copy;
      }
      return [...prev, newRoutine];
    });
  };

  const generateSuggestedRoutine = ({
    days,
    experience,
    goal,
    time,
  }: {
    days: number;
    experience: string;
    goal: string;
    time: number;
    equipment: string;
  }): WorkoutRoutine => {
    let splitType: WorkoutRoutine['splitType'] = 'upper_lower';
    let routineName = `Rotina K — ${days} Dias (${goal.toUpperCase()})`;
    let sessions: WorkoutSession[] = [];

    if (days <= 3) {
      splitType = 'full_body';
      routineName = `K-Full Body (${days}x por semana)`;
      sessions = [
        {
          id: `sess_gen_1_${Date.now()}`,
          name: 'Sessão 1 — Corpo Inteiro (Estímulo de Força)',
          focusMuscles: ['Peitoral', 'Dorsais', 'Quadríceps', 'Ombros'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[8], // Agachamento
            EXERCISE_DATABASE[0], // Supino Reto
            EXERCISE_DATABASE[3], // Puxada Alta
            EXERCISE_DATABASE[6], // Desenvolvimento
            EXERCISE_DATABASE[14], // Panturrilha
          ],
        },
        {
          id: `sess_gen_2_${Date.now()}`,
          name: 'Sessão 2 — Corpo Inteiro (Cadeia Posterior & Puxar)',
          focusMuscles: ['Posteriores', 'Dorsais', 'Peito', 'Braços'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[11], // RDL
            EXERCISE_DATABASE[4], // Remada Curvada
            EXERCISE_DATABASE[1], // Supino Inclinado
            EXERCISE_DATABASE[12], // Rosca Bíceps
            EXERCISE_DATABASE[13], // Tríceps Corda
          ],
        },
        ...(days === 3
          ? [
              {
                id: `sess_gen_3_${Date.now()}`,
                name: 'Sessão 3 — Corpo Inteiro (Volume & Densidade)',
                focusMuscles: ['Quadríceps', 'Ombros', 'Dorsais', 'Peito'],
                estimatedDurationMin: time,
                exercises: [
                  EXERCISE_DATABASE[9], // Leg Press
                  EXERCISE_DATABASE[2], // Crossover
                  EXERCISE_DATABASE[5], // Remada Unilateral
                  EXERCISE_DATABASE[7], // Elevação Lateral
                  EXERCISE_DATABASE[10], // Extensora
                ],
              },
            ]
          : []),
      ];
    } else if (days === 4) {
      splitType = 'upper_lower';
      routineName = `K-Upper/Lower Equilibrado (4x semana)`;
      sessions = [
        {
          id: `sess_u1_${Date.now()}`,
          name: 'Sessão Superior A (Força Base)',
          focusMuscles: ['Peitoral', 'Dorsais', 'Ombros', 'Tríceps'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[0],
            EXERCISE_DATABASE[3],
            EXERCISE_DATABASE[1],
            EXERCISE_DATABASE[4],
            EXERCISE_DATABASE[7],
            EXERCISE_DATABASE[13],
          ],
        },
        {
          id: `sess_l1_${Date.now()}`,
          name: 'Sessão Inferior A (Foco Anterior & Panturrilha)',
          focusMuscles: ['Quadríceps', 'Posteriores', 'Panturrilhas'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[8],
            EXERCISE_DATABASE[11],
            EXERCISE_DATABASE[9],
            EXERCISE_DATABASE[10],
            EXERCISE_DATABASE[14],
          ],
        },
        {
          id: `sess_u2_${Date.now()}`,
          name: 'Sessão Superior B (Hipertrofia & Braços)',
          focusMuscles: ['Dorsais', 'Peitoral', 'Deltoides', 'Bíceps'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[5],
            EXERCISE_DATABASE[2],
            EXERCISE_DATABASE[6],
            EXERCISE_DATABASE[7],
            EXERCISE_DATABASE[12],
            EXERCISE_DATABASE[13],
          ],
        },
        {
          id: `sess_l2_${Date.now()}`,
          name: 'Sessão Inferior B (Foco Posterior & Glúteos)',
          focusMuscles: ['Posteriores', 'Glúteos', 'Quadríceps', 'Panturrilhas'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[11],
            EXERCISE_DATABASE[9],
            EXERCISE_DATABASE[12],
            EXERCISE_DATABASE[10],
            EXERCISE_DATABASE[14],
          ],
        },
      ];
    } else {
      splitType = 'push_pull_legs';
      routineName = `K-Push / Pull / Legs (${days}x semana)`;
      sessions = [
        {
          id: `sess_push_${Date.now()}`,
          name: 'Push (Peitoral, Deltoide Anterior/Lateral, Tríceps)',
          focusMuscles: ['Peitoral', 'Ombros', 'Tríceps'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[0],
            EXERCISE_DATABASE[1],
            EXERCISE_DATABASE[6],
            EXERCISE_DATABASE[7],
            EXERCISE_DATABASE[13],
          ],
        },
        {
          id: `sess_pull_${Date.now()}`,
          name: 'Pull (Dorsais, Deltoide Posterior, Bíceps)',
          focusMuscles: ['Dorsais', 'Bíceps'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[3],
            EXERCISE_DATABASE[4],
            EXERCISE_DATABASE[5],
            EXERCISE_DATABASE[12],
          ],
        },
        {
          id: `sess_legs_${Date.now()}`,
          name: 'Legs (Quadríceps, Isquiotibiais, Panturrilhas)',
          focusMuscles: ['Quadríceps', 'Posteriores', 'Panturrilhas'],
          estimatedDurationMin: time,
          exercises: [
            EXERCISE_DATABASE[8],
            EXERCISE_DATABASE[11],
            EXERCISE_DATABASE[9],
            EXERCISE_DATABASE[12],
            EXERCISE_DATABASE[14],
          ],
        },
      ];
    }

    const newRoutine: WorkoutRoutine = {
      id: `rot_gen_${Date.now()}`,
      name: routineName,
      splitType,
      description: `Rotina adaptada individualmente para nível ${experience}, visando ${goal} com sessões de ${time} minutos.`,
      weeklyFrequency: days,
      sessions,
      isCurrentActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveCustomRoutine(newRoutine);
    setActiveRoutineId(newRoutine.id);
    return newRoutine;
  };

  // Live Workout Controls
  const startWorkout = (session: WorkoutSession, routineId?: string) => {
    const initialSets: Record<string, ExerciseSetLog[]> = {};

    session.exercises.forEach((ex) => {
      const setsCount = ex.defaultSets || 3;
      const targetWeight = ex.targetWeightKg || 20;
      const targetRepsNum = parseInt(ex.defaultReps.split('-')[0], 10) || 10;

      initialSets[ex.id] = Array.from({ length: setsCount }, (_, i) => ({
        setNumber: i + 1,
        weightKg: targetWeight,
        reps: targetRepsNum,
        completed: false,
      }));
    });

    const newActive: ActiveWorkoutState = {
      routineId: routineId || activeRoutine.id,
      sessionId: session.id,
      sessionName: session.name,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      isPaused: false,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      completedSets: initialSets,
      notes: '',
      isRestActive: false,
      restSecondsRemaining: 90,
      restTargetSeconds: 90,
    };

    setActiveWorkout(newActive);
    setCurrentTab('treino_vivo');
  };

  const updateActiveWorkout = (updater: (prev: ActiveWorkoutState) => ActiveWorkoutState) => {
    setActiveWorkout((prev) => (prev ? updater(prev) : null));
  };

  const finishWorkout = (perceivedRecovery = 4, customNotes?: string) => {
    if (!activeWorkout) return;

    // Calculate total volume lifted
    let totalKg = 0;
    let completedExCount = 0;
    const details: WorkoutHistoryEntry['details'] = [];

    const currentSession = activeRoutine.sessions.find((s) => s.id === activeWorkout.sessionId);

    Object.entries(activeWorkout.completedSets).forEach(([exId, sets]) => {
      const completedSets = sets.filter((s) => s.completed);
      if (completedSets.length > 0) {
        completedExCount++;
        const exName = currentSession?.exercises.find((e) => e.id === exId)?.name || 'Exercício';
        details.push({
          exerciseName: exName,
          sets: completedSets.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
        });
        completedSets.forEach((s) => {
          totalKg += s.weightKg * s.reps;
        });
      }
    });

    const durationMin = Math.max(1, Math.round(activeWorkout.elapsedSeconds / 60));

    const newHistoryEntry: WorkoutHistoryEntry = {
      id: `hist_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      sessionName: activeWorkout.sessionName,
      durationMinutes: durationMin,
      totalVolumeKg: Math.round(totalKg),
      exercisesCompletedCount: completedExCount,
      perceivedRecovery,
      notes: customNotes || activeWorkout.notes || 'Sessão concluída com técnica preservada.',
      details,
    };

    setWorkoutHistory((prev) => [newHistoryEntry, ...prev]);
    setActiveWorkout(null);
    setCurrentTab('desempenho');
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const deleteWorkoutHistoryItem = (id: string) => {
    setWorkoutHistory((prev) => prev.filter((h) => h.id !== id));
  };

  // Meal Plan Controls
  const addFoodToMeal = (
    day: DayMealPlan['dayOfWeek'],
    mealType: string,
    food: FoodItem,
    grams: number
  ) => {
    const ratio = grams / food.referenceGrams;
    const newEntry: MealFoodEntry = {
      id: `mf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      foodId: food.id,
      foodName: food.name,
      portionGrams: grams,
      calories: Math.round(food.calories * ratio),
      protein: parseFloat((food.protein * ratio).toFixed(1)),
      carbs: parseFloat((food.carbs * ratio).toFixed(1)),
      fats: parseFloat((food.fats * ratio).toFixed(1)),
      fiber: parseFloat((food.fiber * ratio).toFixed(1)),
    };

    setMealPlan((prev) => {
      const dayPlan = prev.find((d) => d.dayOfWeek === day);
      if (!dayPlan) {
        return [
          ...prev,
          {
            dayOfWeek: day,
            meals: [
              {
                id: `meal_${mealType}_${day}`,
                type: mealType as any,
                title: mealType.toUpperCase(),
                targetTime: '12:00',
                items: [newEntry],
              },
            ],
          },
        ];
      }

      const updatedMeals = [...dayPlan.meals];
      const mealIndex = updatedMeals.findIndex((m) => m.type === mealType);

      if (mealIndex >= 0) {
        updatedMeals[mealIndex] = {
          ...updatedMeals[mealIndex],
          items: [...updatedMeals[mealIndex].items, newEntry],
        };
      } else {
        updatedMeals.push({
          id: `meal_${mealType}_${day}`,
          type: mealType as any,
          title: mealType.toUpperCase(),
          targetTime: '12:00',
          items: [newEntry],
        });
      }

      return prev.map((d) => (d.dayOfWeek === day ? { ...d, meals: updatedMeals } : d));
    });
  };

  const removeFoodFromMeal = (day: DayMealPlan['dayOfWeek'], mealType: string, entryId: string) => {
    setMealPlan((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== day) return d;
        return {
          ...d,
          meals: d.meals.map((m) => {
            if (m.type !== mealType) return m;
            return {
              ...m,
              items: m.items.filter((item) => item.id !== entryId),
            };
          }),
        };
      })
    );
  };

  const updateMealFoodGrams = (
    day: DayMealPlan['dayOfWeek'],
    mealType: string,
    entryId: string,
    grams: number
  ) => {
    setMealPlan((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== day) return d;
        return {
          ...d,
          meals: d.meals.map((m) => {
            if (m.type !== mealType) return m;
            return {
              ...m,
              items: m.items.map((item) => {
                if (item.id !== entryId) return item;
                const originalFood = INITIAL_FOOD_DATABASE.find((f) => f.id === item.foodId);
                if (!originalFood) return { ...item, portionGrams: grams };
                const ratio = grams / originalFood.referenceGrams;
                return {
                  ...item,
                  portionGrams: grams,
                  calories: Math.round(originalFood.calories * ratio),
                  protein: parseFloat((originalFood.protein * ratio).toFixed(1)),
                  carbs: parseFloat((originalFood.carbs * ratio).toFixed(1)),
                  fats: parseFloat((originalFood.fats * ratio).toFixed(1)),
                  fiber: parseFloat((originalFood.fiber * ratio).toFixed(1)),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const duplicateMealsToDay = (fromDay: DayMealPlan['dayOfWeek'], toDay: DayMealPlan['dayOfWeek']) => {
    const sourcePlan = mealPlan.find((d) => d.dayOfWeek === fromDay);
    if (!sourcePlan) return;

    const clonedMeals = JSON.parse(JSON.stringify(sourcePlan.meals));
    setMealPlan((prev) => {
      const exists = prev.some((d) => d.dayOfWeek === toDay);
      if (exists) {
        return prev.map((d) => (d.dayOfWeek === toDay ? { ...d, meals: clonedMeals } : d));
      }
      return [...prev, { dayOfWeek: toDay, meals: clonedMeals }];
    });
  };

  // Shopping List Controls
  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const addShoppingItem = (item: Omit<ShoppingItem, 'id' | 'checked'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop_${Date.now()}`,
      checked: false,
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((i) => i.id !== id));
  };

  const clearBoughtItems = () => {
    setShoppingList((prev) => prev.filter((i) => !i.checked));
  };

  const generateShoppingListFromMealPlan = () => {
    const map = new Map<string, { totalGrams: number; category: ShoppingItem['category'] }>();

    mealPlan.forEach((d) => {
      d.meals.forEach((m) => {
        m.items.forEach((item) => {
          const original = INITIAL_FOOD_DATABASE.find((f) => f.id === item.foodId);
          let cat: ShoppingItem['category'] = 'graos_mercearia';
          if (original) {
            if (original.category === 'proteina') cat = 'carnes_ovos';
            else if (original.category === 'legumes_verduras' || original.category === 'frutas') cat = 'hortifruti';
            else if (original.category === 'carboidratos' || original.category === 'gorduras_oleaginosas') cat = 'graos_mercearia';
            else cat = 'graos_mercearia';
          }
          const prevGrams = map.get(item.foodName)?.totalGrams || 0;
          map.set(item.foodName, { totalGrams: prevGrams + item.portionGrams, category: cat });
        });
      });
    });

    const newItems: ShoppingItem[] = Array.from(map.entries()).map(([name, data]) => ({
      id: `gen_shop_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name,
      category: data.category,
      quantity: data.totalGrams >= 1000 ? `${(data.totalGrams / 1000).toFixed(1)} kg` : `${Math.round(data.totalGrams)} g`,
      checked: false,
      fromMealPlanner: true,
    }));

    setShoppingList((prev) => {
      const manualItems = prev.filter((p) => !p.fromMealPlanner);
      return [...newItems, ...manualItems];
    });
  };

  // Favorites Control
  const toggleFavoriteFood = (foodId: string) => {
    setFavoriteFoodIds((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
    );
  };

  // Calendar Controls
  const addCalendarWorkout = (workout: CalendarWorkout) => {
    setCalendarWorkouts((prev) => {
      const exists = prev.findIndex((w) => w.id === workout.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = workout;
        return copy;
      }
      return [...prev, workout];
    });
  };

  const updateCalendarWorkout = (workout: CalendarWorkout) => {
    setCalendarWorkouts((prev) => prev.map((w) => (w.id === workout.id ? workout : w)));
  };

  const toggleCalendarWorkoutStatus = (id: string) => {
    setCalendarWorkouts((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const nextStatus: CalendarWorkout['status'] =
          w.status === 'concluido' ? 'programado' : w.status === 'programado' ? 'concluido' : 'programado';
        return {
          ...w,
          status: nextStatus,
          exercises: w.exercises.map((ex) => ({
            ...ex,
            completed: nextStatus === 'concluido',
          })),
        };
      })
    );
  };

  const deleteCalendarWorkout = (id: string) => {
    setCalendarWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  // Body Measurements Controls
  const addBodyMeasurement = (entry: Omit<BodyMeasurementEntry, 'id'>) => {
    const newEntry: BodyMeasurementEntry = {
      ...entry,
      id: `bm_${Date.now()}`,
    };
    setBodyMeasurements((prev) => [newEntry, ...prev]);
  };

  const deleteBodyMeasurement = (id: string) => {
    setBodyMeasurements((prev) => prev.filter((bm) => bm.id !== id));
  };

  // Progress Photos Controls
  const addProgressPhoto = (photo: Omit<ProgressPhoto, 'id'>) => {
    const newPhoto: ProgressPhoto = {
      ...photo,
      id: `photo_${Date.now()}`,
    };
    setProgressPhotos((prev) => [newPhoto, ...prev]);
  };

  const deleteProgressPhoto = (id: string) => {
    setProgressPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Habits Controls
  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const resetDailyHabits = () => {
    setHabits((prev) => prev.map((h) => ({ ...h, completed: false })));
  };

  // Export / Import
  const exportDataJSON = () => {
    const data = {
      profile: userProfile,
      routines,
      history: workoutHistory,
      meals: mealPlan,
      shopping: shoppingList,
      habits,
      favorites: favoriteFoodIds,
      calendar: calendarWorkouts,
      measurements: bodyMeasurements,
      photos: progressPhotos,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) setUserProfile(parsed.profile);
      if (parsed.routines) setRoutines(parsed.routines);
      if (parsed.history) setWorkoutHistory(parsed.history);
      if (parsed.meals) setMealPlan(parsed.meals);
      if (parsed.shopping) setShoppingList(parsed.shopping);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.favorites) setFavoriteFoodIds(parsed.favorites);
      if (parsed.calendar) setCalendarWorkouts(parsed.calendar);
      if (parsed.measurements) setBodyMeasurements(parsed.measurements);
      if (parsed.photos) setProgressPhotos(parsed.photos);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        userProfile,
        updateUserProfile,
        routines,
        activeRoutine,
        setActiveRoutineId,
        saveCustomRoutine,
        generateSuggestedRoutine,
        activeWorkout,
        startWorkout,
        updateActiveWorkout,
        finishWorkout,
        cancelWorkout,
        workoutHistory,
        deleteWorkoutHistoryItem,
        mealPlan,
        addFoodToMeal,
        removeFoodFromMeal,
        updateMealFoodGrams,
        duplicateMealsToDay,
        foodDatabase: INITIAL_FOOD_DATABASE,
        favoriteFoodIds,
        toggleFavoriteFood,
        shoppingList,
        toggleShoppingItem,
        addShoppingItem,
        deleteShoppingItem,
        clearBoughtItems,
        generateShoppingListFromMealPlan,
        habits,
        toggleHabit,
        resetDailyHabits,
        calendarWorkouts,
        addCalendarWorkout,
        updateCalendarWorkout,
        toggleCalendarWorkoutStatus,
        deleteCalendarWorkout,
        bodyMeasurements,
        addBodyMeasurement,
        deleteBodyMeasurement,
        progressPhotos,
        addProgressPhoto,
        deleteProgressPhoto,
        playTimerBeep,
        exportDataJSON,
        importDataJSON,
        isCloudSyncing,
        lastSyncedAt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
