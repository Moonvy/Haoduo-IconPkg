
import { register } from '../core.js';

const lookup = "AAAB3YkZAVYYRRrFnSkXWCMoYzVFQnNUUyl0V4hmRVI3ZDZEdWY0IzOoQyRUdVNIN2R3ClhGnAIBAkg9Ah8JA04FIxOZFgYGNxqkAkhsLTchAW8kAgI8AgoKAycjB2AKCQEFvQKHHwYQAQQHIFMIBE0KkwEEFMcDvQGyEQJZAVZrM0dZH+q4MbBdLlaXshHmYeDSqY1yOLuDN3HoYMYCnLvZqIK1pzDG/nOdiZRE6NrGWPdbzoS8XZxoO52xcWncbs/Rp2RtbNw3XfrxGHJH/tqWvpyQMep+DDtWlX/zJPCWljXCT4gUBcA5V3k4Dx+s1uEXeFvnW0XT43vaKaMR9EeRX/3Bih8qadBt0PKVhIdhLnqy/hU2tR7fgJJ10CndCsiKzHSlN2c0OnUdv1kaJNxfEkGqlxtX5lEfYmWUswjPVNFoHxsk01fUQkyjoNFQm4X3bQ58rfLXKUq4Q8lwFoksRdzqD6k1DsGbjBsIUvMRk0NYQfsB7wZtq3+SZq3c2tBTM5WBTHlhjcd6JzvDdG3udx1IQud5uvMwZh++fHOQZy6KpYIHLHS94DUykzCI7bpZhfLT6CpE8EtilEg/rDxK9KoyptLkUJRrP1fWvtazkF85bM5JgEECAAAwIAABAAAAAAIAAAAScmFkaXgtaWNvbnMtMDEuc3ZnAAAAEnJhZGl4LWljb25zLTAyLnN2Z/////8AAAACAAAAVgABAAFBBRBAAAFVAARRFUEQQUBBQEQFARQEQBFARAEUEAFREBRQQAVAVRAAURUFFAAFUQEAQBEFBFQUUBURFAFQUABRRQVEAARRVQVQBQUEEABFRQAFAAAAAA==";

const chunks = {
  "radix-icons-01.svg": new URL("./radix-icons-01.svg", import.meta.url).href,
  "radix-icons-02.svg": new URL("./radix-icons-02.svg", import.meta.url).href
};

register('radix-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
