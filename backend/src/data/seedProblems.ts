import type { Difficulty } from "../types/domain";

export interface SeedProblem {
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  constraints: string[];
  expectedConcepts: string[];
}

export const SEED_PROBLEMS: SeedProblem[] = [
  {
    title: "Vending Machine",
    slug: "vending-machine",
    difficulty: "Easy",
    description:
      "Design a vending machine that displays products, accepts payment, dispenses items, and returns change. The machine should stay consistent when products sell out or a transaction is cancelled.",
    requirements: [
      "Display available products with price and remaining quantity.",
      "Accept payment in coins or a card and track the current balance.",
      "Allow product selection only when funds and stock are sufficient.",
      "Dispense the selected product and return leftover change.",
      "Support cancelling a transaction and refunding inserted money.",
      "Handle sold-out products without breaking other purchases.",
    ],
    constraints: [
      "Do not assume a GUI; model domain objects and their interactions.",
      "Payment method may change later (cash, card, wallet).",
      "Inventory is limited and must not go negative.",
    ],
    expectedConcepts: ["State Pattern", "Strategy Pattern", "Encapsulation", "Single Responsibility"],
  },
  {
    title: "Library Management System",
    slug: "library-management-system",
    difficulty: "Medium",
    description:
      "Design a library system for cataloguing books, registering members, issuing and returning copies, and applying due-date rules. Multiple copies of the same title can exist.",
    requirements: [
      "Store titles and individual book copies with availability.",
      "Register members and keep their active loans.",
      "Issue a copy to a member if it is available and the member is under the loan limit.",
      "Return a copy, mark it available, and compute late fees when overdue.",
      "Search the catalogue by title, author, or ISBN.",
      "Prevent issuing a copy that is already on loan.",
    ],
    constraints: [
      "A title can have many copies; loans attach to copies, not titles.",
      "Loan limits and fee rules should be easy to change.",
      "Do not persist a full SQL schema; focus on object design.",
    ],
    expectedConcepts: ["Association", "Composition", "Encapsulation", "Strategy Pattern"],
  },
  {
    title: "Parking Lot",
    slug: "parking-lot",
    difficulty: "Medium",
    description:
      "Design a parking lot that assigns spots to vehicles of different sizes, issues tickets on entry, and calculates fees on exit. The lot has multiple floors and spot types.",
    requirements: [
      "Model floors and parking spots of types such as motorcycle, compact, and large.",
      "Park a vehicle in a compatible free spot and issue a ticket.",
      "Reject entry when no compatible spot is free.",
      "Unpark using a ticket, free the spot, and calculate the parking fee.",
      "Support different fee strategies (hourly, flat, or peak hours).",
      "Allow looking up occupancy by floor.",
    ],
    constraints: [
      "A motorcycle may use a larger spot if needed; a bus cannot use a compact spot.",
      "Fee calculation should be replaceable without rewriting the lot.",
      "Spot assignment should not require scanning the entire lot if a better structure exists.",
    ],
    expectedConcepts: ["Abstraction", "Composition", "Interfaces", "Strategy Pattern"],
  },
  {
    title: "Elevator System",
    slug: "elevator-system",
    difficulty: "Hard",
    description:
      "Design an elevator control system for a building with multiple shafts. Riders request elevators from floors and select destinations inside a car. The scheduler should move cars efficiently and safely.",
    requirements: [
      "Accept hall calls (up/down) and car destination requests.",
      "Assign a car to a hall call using a scheduling policy.",
      "Move cars between floors, open/close doors, and complete requests.",
      "Support multiple elevators sharing the same building.",
      "Prevent unsafe states such as moving with open doors.",
      "Allow replacing the dispatch strategy (nearest car, SCAN, etc.).",
    ],
    constraints: [
      "Do not simulate physics; model control flow and responsibilities.",
      "Requests can arrive while cars are in motion.",
      "A car has a capacity limit.",
    ],
    expectedConcepts: ["State Pattern", "Strategy Pattern", "Observer Pattern", "Cohesion"],
  },
  {
    title: "Movie Ticket Booking",
    slug: "movie-ticket-booking",
    difficulty: "Hard",
    description:
      "Design a movie ticket booking system for theatres, screens, shows, and seats. Users search shows, pick seats, and complete a booking. Concurrent reservation of the same seat must be handled in the design.",
    requirements: [
      "Model movies, theatres, screens, shows, and seat maps.",
      "Search shows by movie, city, and time.",
      "Let a user select available seats for a show.",
      "Temporarily hold seats, then confirm after payment or release on timeout/failure.",
      "Prevent double-booking the same seat for a show.",
      "Support different seat categories and pricing.",
    ],
    constraints: [
      "Seat inventory is per show, not per theatre forever.",
      "Payment is an external step; model success and failure.",
      "Pricing and hold duration should be configurable.",
    ],
    expectedConcepts: ["Aggregation", "Concurrency Control", "State Pattern", "Encapsulation"],
  },
];
