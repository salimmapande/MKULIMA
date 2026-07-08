import type { CalendarTask, CropType } from "./types";

export const cropLabels: Record<CropType, { en: string; sw: string }> = {
  maize: { en: "Maize", sw: "Mahindi" },
  beans: { en: "Beans", sw: "Maharage" },
  coffee: { en: "Coffee", sw: "Kahawa" },
  tea: { en: "Tea", sw: "Chai" },
  tomatoes: { en: "Tomatoes", sw: "Nyanya" },
  potatoes: { en: "Potatoes", sw: "Viazi" },
  cassava: { en: "Cassava", sw: "Mihogo" },
  sorghum: { en: "Sorghum", sw: "Mtama" },
};

export const tanzanianRegions = [
  "Arusha",
  "Dar es Salaam",
  "Dodoma",
  "Geita",
  "Iringa",
  "Kagera",
  "Katavi",
  "Kigoma",
  "Kilimanjaro",
  "Lindi",
  "Manyara",
  "Mara",
  "Mbeya",
  "Morogoro",
  "Mtwara",
  "Mwanza",
  "Njombe",
  "Pemba Kaskazini",
  "Pemba Kusini",
  "Pwani",
  "Rukwa",
  "Ruvuma",
  "Shinyanga",
  "Simiyu",
  "Singida",
  "Songwe",
  "Tabora",
  "Tanga",
  "Unguja Kaskazini",
  "Unguja Kusini",
  "Unguja Mjini Magharibi",
  "Other",
];

export const calendarTasks: CalendarTask[] = [
  {
    id: "1", title: "Prepare land for planting", titleSw: "Andaa shamba kwa kupanda",
    description: "Clear weeds, plough, and add compost before rains begin.",
    descriptionSw: "Ondoa magugu, lima, na ongeza mbolea kabla ya mvua.",
    month: 3, crop: "maize", priority: "high",
  },
  {
    id: "2", title: "Plant maize with rains", titleSw: "Panda mahindi na mvua",
    description: "Sow seeds 5cm deep, 75cm between rows when soil is moist.",
    descriptionSw: "Panda mbegu senti 5 chini, safu 75cm zikiwa na unyevu.",
    month: 3, crop: "maize", priority: "high",
  },
  {
    id: "3", title: "First weeding", titleSw: "Kupalilia mara ya kwanza",
    description: "Weed 2–3 weeks after planting to reduce competition.",
    descriptionSw: "Palilia wiki 2-3 baada ya kupanda ili kupunguza magugu.",
    month: 4, crop: "maize", priority: "medium",
  },
  {
    id: "4", title: "Top-dress with CAN fertilizer", titleSw: "Ongeza mbolea ya CAN",
    description: "Apply 50kg CAN per acre at knee-high stage.",
    descriptionSw: "Tumia kilo 50 CAN kwa ekari wakati mahindi yanapofika magoti.",
    month: 5, crop: "maize", priority: "high",
  },
  {
    id: "5", title: "Scout for fall armyworm", titleSw: "Angalia mdudu wa jeshi",
    description: "Check whorl leaves weekly. Use Bt or recommended pesticide if found.",
    descriptionSw: "Angalia majani kila wiki. Tumia dawa inayopendekezwa ukiona mdudu.",
    month: 5, crop: "maize", priority: "high",
  },
  {
    id: "6", title: "Plant beans (intercrop)", titleSw: "Panda maharage",
    description: "Intercrop beans with maize for nitrogen fixation.",
    descriptionSw: "Panda maharage pamoja na mahindi kwa nitrogen.",
    month: 4, crop: "beans", priority: "medium",
  },
  {
    id: "7", title: "Harvest maize", titleSw: "Vuna mahindi",
    description: "Harvest when kernels are hard and moisture is below 20%.",
    descriptionSw: "Vuna mahindi yakiwa magumu na unyevu chini ya 20%.",
    month: 8, crop: "maize", priority: "high",
  },
  {
    id: "8", title: "Dry and store grain", titleSw: "Kausha na hifadhi nafaka",
    description: "Sun-dry on tarpaulin. Store in hermetic bags with PICS.",
    descriptionSw: "Kausha jua. Hifadhi kwenye mifuko ya PICS.",
    month: 9, crop: "maize", priority: "high",
  },
  {
    id: "9", title: "Prune coffee trees", titleSw: "Kata matawi ya kahawa",
    description: "Remove dead wood and suckers after main harvest.",
    descriptionSw: "Ondoa matawi yaliyokufa baada ya mavuno.",
    month: 2, crop: "coffee", priority: "medium",
  },
  {
    id: "10", title: "Apply foliar feed to tomatoes", titleSw: "Ongeza mbolea ya majani kwa nyanya",
    description: "Spray calcium-rich foliar at flowering to prevent blossom end rot.",
    descriptionSw: "Nyunyiza mbolea ya kalsiamu wakati wa kuchanua.",
    month: 6, crop: "tomatoes", priority: "medium",
  },
];

export function getTasksForCrops(crops: CropType[], month?: number): CalendarTask[] {
  const m = month ?? new Date().getMonth() + 1;
  return calendarTasks.filter(
    (t) => (t.crop === "all" || crops.includes(t.crop)) && t.month === m
  );
}

export function getUpcomingTasks(crops: CropType[]): CalendarTask[] {
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  return calendarTasks.filter(
    (t) =>
      (t.crop === "all" || crops.includes(t.crop)) &&
      (t.month === currentMonth || t.month === nextMonth)
  );
}
