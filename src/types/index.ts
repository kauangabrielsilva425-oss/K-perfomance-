export type FitnessGoal = 'hipertrofia' | 'forca' | 'recomposicao' | 'resistencia' | 'saude_geral';
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';
export type EquipmentAccess = 'academia_completa' | 'halteres_banco' | 'peso_corporal' | 'home_gym';
export type DietPreference = 'onivora' | 'vegetariana' | 'vegana' | 'sem_lactose' | 'sem_gluten';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  gender: 'masculino' | 'feminino' | 'outro';
  goal: FitnessGoal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  availableDays: ('seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom')[];
  timePerSessionMin: number;
  equipment: EquipmentAccess;
  dietPreference: DietPreference;
  allergies: string[];
  usualWorkoutTime: string;
  targetDailyCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatsGrams: number;
  targetWaterMl: number;
  habitsFocus: string[];
  onboardingCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'peitoral' | 'dorsais' | 'ombros' | 'quadriceps' | 'posteriores' | 'gluteos' | 'biceps' | 'triceps' | 'core' | 'panturrilhas';
  equipmentRequired: string;
  defaultSets: number;
  defaultReps: string;
  suggestedRestSeconds: number;
  executionInstructions: string[];
  formCues: string[];
  alternatives: string[];
  targetWeightKg?: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  focusMuscles: string[];
  exercises: Exercise[];
  estimatedDurationMin: number;
  targetDayOfWeek?: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  splitType: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'abcd' | 'personalizada';
  description: string;
  weeklyFrequency: number;
  sessions: WorkoutSession[];
  isCurrentActive: boolean;
  createdAt: string;
}

export interface ExerciseSetLog {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (6-10)
}

export interface ActiveWorkoutState {
  routineId: string;
  sessionId: string;
  sessionName: string;
  startedAt: string;
  elapsedSeconds: number;
  isPaused: boolean;
  currentExerciseIndex: number;
  currentSetIndex: number;
  completedSets: Record<string, ExerciseSetLog[]>; // exerciseId -> sets
  notes: string;
  isRestActive: boolean;
  restSecondsRemaining: number;
  restTargetSeconds: number;
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string;
  sessionName: string;
  durationMinutes: number;
  totalVolumeKg: number;
  exercisesCompletedCount: number;
  perceivedRecovery: number; // 1 to 5
  notes?: string;
  details: {
    exerciseName: string;
    sets: { weightKg: number; reps: number }[];
  }[];
}

export type FoodCategory =
  | 'proteina'
  | 'carboidratos'
  | 'frutas'
  | 'legumes_verduras'
  | 'gorduras_oleaginosas'
  | 'lanches_praticos'
  | 'outros_variados';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  portionUnit: string;
  referenceGrams: number;
  calories: number; // porção
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  preparationSuggestions: string[];
  combinationTips: string;
  mealTimingSuggestions: ('Café da manhã' | 'Almoço' | 'Pré-treino' | 'Pós-treino' | 'Lanche' | 'Jantar' | 'Ceia')[];
  allergens: string[];
  dietaryTags: ('vegano' | 'vegetariano' | 'sem_gluten' | 'sem_lactose' | 'rico_proteina')[];
  source: string;
  isPopularFitness?: boolean;
}

export interface MealFoodEntry {
  id: string;
  foodId: string;
  foodName: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface Meal {
  id: string;
  type: 'cafe' | 'almoco' | 'lanche' | 'pre_treino' | 'pos_treino' | 'jantar' | 'ceia';
  title: string;
  targetTime: string;
  items: MealFoodEntry[];
  notes?: string;
}

export interface DayMealPlan {
  dayOfWeek: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';
  meals: Meal[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'hortifruti' | 'carnes_ovos' | 'graos_mercearia' | 'laticinios_bebidas' | 'suplementos_outros';
  quantity: string;
  checked: boolean;
  notes?: string;
  fromMealPlanner?: boolean;
}

export interface HabitItem {
  id: string;
  title: string;
  description: string;
  category: 'agua' | 'sono' | 'treino' | 'nutricao' | 'recuperacao' | 'foco';
  target: string;
  completed: boolean;
}

export interface SupplementProfile {
  id: string;
  name: string;
  scientificName: string;
  category: 'performance' | 'proteina' | 'estimulante' | 'saude_longevidade' | 'aminoacidos' | 'recuperacao';
  summary: string;
  primaryPurpose: string;
  evidenceLevel: 'Grau A (Consenso Científico Alto)' | 'Grau B (Evidências Positivas)' | 'Grau C (Emergente/Inconclusivo)';
  evidenceDetails: string[];
  limitations: string[];
  adverseEffects: string[];
  contraindications: string[];
  labelReadingGuide: string[];
  compositionAnalysis: string;
  safetyNotice: string;
  isPopularWarning: string;
  whoShouldTake: string;
  howItWorks: string;
  recommendedTiming: string;
}

export type SupplementCategory =
  | 'creatina'
  | 'whey'
  | 'proteina_vegetal'
  | 'cafeina'
  | 'beta_alanina'
  | 'bcaa'
  | 'glutamina'
  | 'multivitaminico'
  | 'omega_3'
  | 'eletrolitos'
  | 'pre_treino'
  | 'hipercalorico';

export interface SupplementRankedProduct {
  id: string;
  name: string;
  brand: string;
  category: SupplementCategory;
  categoryLabel: string;
  overallScore: number; // 0 to 100
  rankPosition: number; // #1, #2, #3, etc.
  rankingRationale: string;
  packageSize: string;
  servingSize: string;
  servingsPerContainer: number;
  activeIngredientAmount: string;
  approxPriceBRL: number;
  costPerServingBRL: number;
  priceDateConsulted: string;
  verifiedLabTested: boolean;
  labDetails?: string;
  positives: string[];
  limitations: string[];
  source: string;
  officialUrl?: string;
  isBestValue?: boolean;
  isTopRated?: boolean;
}

export interface SupplementComparisonProduct {
  id: string;
  brand: string;
  productName: string;
  category: 'creatina' | 'pre_treino' | 'whey' | 'cafeina' | 'bcaa' | 'beta_alanina' | 'hipercalorico';
  servingGrams: number;
  servingsPerContainer: number;
  activeIngredients: { name: string; amount: string; purpose: string }[];
  caffeineMgPerServing: number;
  betaAlanineMg?: number;
  creatineMg?: number;
  proteinGrams?: number;
  sugarCarbsGrams: number;
  fillerAlerts: string[];
  priceApproxBRL: number;
  costPerActiveServingBRL: number;
  summaryAssessment: string;
}

export interface StrengthMetric {
  date: string;
  exercise: string;
  weightKg: number;
  reps: number;
  estimated1RM: number;
}

export interface CalendarWorkout {
  id: string;
  dateISO: string; // YYYY-MM-DD
  title: string;
  type: 'forca' | 'hipertrofia' | 'cardio' | 'mobilidade' | 'descanso';
  status: 'programado' | 'concluido' | 'descanso';
  durationMinutes?: number;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weightKg?: number;
    completed?: boolean;
  }[];
  notes?: string;
}

export interface BodyMeasurementEntry {
  id: string;
  dateISO: string;
  weightKg: number;
  bodyFatPercent?: number;
  chestCm?: number;
  armsCm?: number;
  waistCm?: number;
  hipsCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  dateISO: string;
  photoUrl: string; // base64 or safe data url
  label?: string;
  notes?: string;
}
