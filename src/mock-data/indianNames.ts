export const FIRST_NAMES = [
  "Rahul", "Priya", "Arjun", "Sneha", "Amit", "Vikram", "Ananya", "Rajesh",
  "Deepika", "Rohan", "Pooja", "Suresh", "Kavita", "Aditya", "Neha", "Manoj",
  "Meera", "Karthik", "Divya", "Sanjay", "Tanvi", "Varun", "Ritu", "Harish",
  "Shweta", "Alok", "Nisha", "Gaurav", "Sunita", "Prateek", "Isha", "Naveen",
  "Roshni", "Sachin", "Swati", "Ashish", "Preeti", "Kunal", "Simran", "Manish",
  "Aarti", "Vishal", "Pallavi", "Nikhil", "Shalini", "Vivek", "Bhavna", "Abhishek",
  "Shruti", "Tarun"
];

export const LAST_NAMES = [
  "Sharma", "Reddy", "Kumar", "Patel", "Verma", "Malhotra", "Iyer", "Gupta",
  "Mehta", "Singh", "Nair", "Joshi", "Chopra", "Deshmukh", "Bhatia", "Rao",
  "Agarwal", "Menon", "Saxena", "Choudhury", "Bansal", "Kulkarni", "Mishra",
  "Kapoor", "Mukherjee", "Chatterjee", "Shah", "Sen", "Pillai", "Bhattacharya"
];

export const PAYMENT_METHODS = ["UPI", "Card", "Netbanking", "Wallet"] as const;

export const FAILURE_REASONS = [
  "Insufficient Funds",
  "Card Declined",
  "Timeout",
  "Network Error",
  "Bank Server Error",
  "Authentication Failed",
] as const;

export function getRandomElement<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
