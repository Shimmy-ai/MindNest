import React, { useState, useEffect } from "react";
// Built-in quotes
const initialQuotes = [
  "Stay positive, work hard, make it happen!",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "Dream big and dare to fail.",
  "The only way to do great work is to love what you do.",
  "I don’t follow the crowd. I walk my own path.",
  "Silence is my weapon; action is my language.",
  "I don’t compete with anyone; I compete with myself.",
  "I value freedom over popularity.",
  "Strength is not shown in words, but in deeds.",
  "I don’t explain myself. I just exist and let the world catch up.",
  "Lone wolves aren’t lonely—they’re selective.",
  "I answer to no one but my own standards.",
  "The less I say, the more they wonder.",
  "I don’t chase success. I let it chase me."
];
import Calendar from 'react-calendar';
const API_URL = import.meta.env.VITE_API_URL;
import 'react-calendar/dist/Calendar.css';
import { Box, Flex, Heading, Spacer, Button, IconButton, useColorMode, Input, Stack, ScaleFade } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
// Weather API for Stockholm, Sweden (next 6 hours, with rain, snow, real feel)
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=59.3293&longitude=18.0686&hourly=temperature_2m,apparent_temperature,windspeed_10m,precipitation,snowfall&current_weather=true";

const navItems = ["Calendar", "Habits", "Goals", "Worries", "Gratitude", "Spending"];

export default function Dashboard() {
  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherHourly, setWeatherHourly] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  useEffect(() => {
    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        const res = await fetch(WEATHER_API);
        const data = await res.json();
        setWeather(data.current_weather);
        // Get next 6 hours
        const now = new Date();
        const hours = data.hourly.time.map(t => new Date(t));
        const nextHours = [];
        for (let i = 0; i < hours.length; i++) {
          if (hours[i] > now && nextHours.length < 6) {
            nextHours.push({
              time: hours[i],
              temp: data.hourly.temperature_2m[i],
              realFeel: data.hourly.apparent_temperature[i],
              wind: data.hourly.windspeed_10m[i],
              rain: data.hourly.precipitation[i],
              snow: data.hourly.snowfall[i]
            });
          }
        }
        setWeatherHourly(nextHours);
      } catch {
        setWeather(null);
        setWeatherHourly([]);
      }
      setWeatherLoading(false);
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // update every 10 min
    return () => clearInterval(interval);
  }, []);
  // Add state for showing gratitude inputs
  const [showGratitudeInputs, setShowGratitudeInputs] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const [activeSection, setActiveSection] = useState("Calendar");
  // Reset showGratitudeInputs when switching sections
  useEffect(() => {
    setShowGratitudeInputs(false);
  }, [activeSection]);
  const [inputValue, setInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({}); // { 'YYYY-MM-DD': [event1, event2] }
  // Fetch events for selected date
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/events?date=${dateKey}`)
      .then(res => res.json())
      .then(data => {
        setEvents(prev => ({ ...prev, [dateKey]: Array.isArray(data) ? data : [] }));
      })
      .catch(() => {
        setEvents(prev => ({ ...prev, [dateKey]: [] }));
      });
  }, [selectedDate]);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [quoteInput, setQuoteInput] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");
  // Fetch a random quote from API
  const fetchApiQuote = async () => {
    try {
      const res = await fetch("https://api.quotable.io/random");
      const data = await res.json();
      setCurrentQuote(data.content);
    } catch {
      setCurrentQuote("Could not fetch quote. Try again later.");
    }
  };

  // Pick a random quote from local list
  const pickLocalQuote = () => {
    const idx = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[idx]);
  };

  useEffect(() => {
    pickLocalQuote();
    const interval = setInterval(() => {
      pickLocalQuote();
    }, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [quotes]);
  const handleAddQuote = () => {
    if (!quoteInput) return;
    setQuotes(prev => [...prev, quoteInput]);
    setQuoteInput("");
  };

  const handleNavClick = (item) => {
    setActiveSection(item);
    setInputValue("");
    pickLocalQuote();
  };

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const [habits, setHabits] = useState([]);
  // Fetch habits for selected date
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/habits?date=${dateKey}`)
      .then(res => res.json())
      .then(data => setHabits(Array.isArray(data) ? data : []))
      .catch(() => setHabits([]));
  }, [selectedDate]);
  const [gratitude, setGratitude] = useState([]);
  const [gratitudeInput, setGratitudeInput] = useState("");
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/gratitude?date=${dateKey}`)
      .then(res => res.json())
      .then(data => setGratitude(Array.isArray(data) ? data.map((entry, i) => ({ ...entry, display: `${dateKey}.${i+1}` })) : []))
      .catch(() => setGratitude([]));
  }, [selectedDate]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [worries, setWorries] = useState([]);
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/worries?date=${dateKey}`)
      .then(res => res.json())
      .then(data => setWorries(Array.isArray(data) ? data : []))
      .catch(() => setWorries([]));
  }, [selectedDate]);
  const [goals, setGoals] = useState([]);
  useEffect(() => {
    if (activeSection === "Goals") {
      const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/goals?date=${dateKey}`)
        .then(res => res.json())
        .then(data => setGoals(Array.isArray(data) ? data : []))
        .catch(() => setGoals([]));
    }
  }, [activeSection, selectedDate]);
  // Add state for spending
  const [spending, setSpending] = useState({});
  const [spendingInput, setSpendingInput] = useState("");
  // Add state for spending item
  const [spendingItem, setSpendingItem] = useState("");
  // Fetch spending for selected date
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/spending?date=${dateKey}`)
      .then(res => res.json())
      .then(data => {
        setSpending(prev => ({ ...prev, [dateKey]: Array.isArray(data) ? data : [] }));
      })
      .catch(() => {
        setSpending(prev => ({ ...prev, [dateKey]: [] }));
      });
  }, [selectedDate]);
  const handleAdd = () => {
    if (activeSection === "Calendar") {
      if (!inputValue) return;
      const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue, date: dateKey })
      })
        .then(res => res.json())
        .then(data => {
          setEvents(prev => ({ ...prev, [dateKey]: Array.isArray(data) ? data : [] }));
          setInputValue("");
        })
        .catch(() => {
          setEvents(prev => ({
            ...prev,
            [dateKey]: prev[dateKey] ? [...prev[dateKey], { text: inputValue, date: dateKey }] : [{ text: inputValue, date: dateKey }]
          }));
          setInputValue("");
        });
    } else if (activeSection === "Habits") {
      if (!inputValue) return;
      // POST new habit to backend with date
      const dateKey = selectedDate.toISOString().split('T')[0];
  fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit: inputValue, date: dateKey })
      })
        .then(res => res.json())
        .then(data => {
          setHabits(Array.isArray(data) ? data : []);
          setInputValue("");
        })
        .catch(() => {
          setHabits(prev => [...prev, { text: inputValue, date: dateKey }]);
          setInputValue("");
        });
    } else if (activeSection === "Gratitude") {
      if (!inputValue) return;
      setGratitude(prev => [...prev, inputValue]);
      setInputValue("");
    } else {
      if (!inputValue) return;
      // For Goals, Worries, Quotes, just alert for now
      alert(`Added to ${activeSection}: ${inputValue}`);
      const newEntries = gratitudeInputs.filter(entry => entry.trim() !== "");
      if (newEntries.length === 0) return;
      setGratitude(prev => [...prev, ...newEntries]);
      setGratitudeInputs(["", "", ""]);
    }
  };
  // Remove stray JSX blocks here. Only use the main return statement below.

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
      <Box as="nav" p={4} bg={colorMode === "light" ? "white" : "gray.900"} boxShadow="md">
          <Stack direction={{ base: "column", md: "row" }} spacing={2} align="center" justify="center">
            {/* Top row: Calendar, Habits, Theme toggle */}
            {[0, 1].map(idx => (
              <Box as={motion.div} key={navItems[idx]}
                animate={activeSection === navItems[idx] ? { scale: 1.15, boxShadow: "0 0 0 4px #31979533" } : { scale: 1, boxShadow: "none" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Button
                  variant={activeSection === navItems[idx] ? "solid" : "ghost"}
                  colorScheme="teal"
                  size="md"
                  fontWeight="bold"
                  onClick={() => handleNavClick(navItems[idx])}
                >
                  {navItems[idx]}
                </Button>
              </Box>
            ))}
            <IconButton
              aria-label="Toggle theme"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              colorScheme="teal"
              size="md"
              boxShadow="md"
              ml={2}
              transition="all 0.2s"
            />
          </Stack>
          <Stack direction={{ base: "column", md: "row" }} spacing={2} align="center" justify="center" mt={2}>
            {/* Second row: Goals, Worries, Gratitude, Spending */}
            {navItems.slice(2).map(item => (
              <Box as={motion.div} key={item}
                animate={activeSection === item ? { scale: 1.15, boxShadow: "0 0 0 4px #31979533" } : { scale: 1, boxShadow: "none" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Button
                  variant={activeSection === item ? "solid" : "ghost"}
                  colorScheme="teal"
                  size="md"
                  fontWeight="bold"
                  onClick={() => handleNavClick(item)}
                >
                  {item}
                </Button>
              </Box>
            ))}
          </Stack>
      </Box>
      <Box p={8} display="flex" flexDirection="column" alignItems="center">
        <ScaleFade in={activeSection === "Calendar"} initialScale={0.8} unmountOnExit transition={{ enter: { duration: 0.6 }, exit: { duration: 0.3 } }}>
          <Box>
            <Box mb={8}>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
              />
            </Box>
            <Stack spacing={4} maxW="md" w="100%" align="center">
              <Heading size="md">
                Add appointment for {selectedDate.getDate()}-{selectedDate.getMonth() + 1}-{selectedDate.getFullYear()}
              </Heading>
              <Input
                placeholder="Type your appointment..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              <Button colorScheme="teal" onClick={handleAdd}>
                Add
              </Button>
            </Stack>
          </Box>
        </ScaleFade>
        <ScaleFade in={activeSection === "Habits"} initialScale={0.8} unmountOnExit transition={{ enter: { duration: 0.6 }, exit: { duration: 0.3 } }}>
          {activeSection === "Habits" && (() => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            return (
              <Stack spacing={4} maxW="md" w="100%" align="center">
                <Heading size="md">What habit do you want to quit today?</Heading>
                <Input
                  placeholder="Type the habit you want to quit..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <Button colorScheme="teal" onClick={() => {
                  if (!inputValue) return;
                  fetch(`${API_URL}/habits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ habit: inputValue, date: dateKey })
                  })
                    .then(res => res.json())
                    .then(data => {
                      setHabits(Array.isArray(data) ? data : []);
                      setInputValue("");
                      setShowConfirm(true);
                      setTimeout(() => setShowConfirm(false), 2000);
                    })
                    .catch(() => {
                      setHabits(prev => [...prev, { text: inputValue, date: dateKey }]);
                      setInputValue("");
                      setShowConfirm(true);
                      setTimeout(() => setShowConfirm(false), 2000);
                    });
                }}>
                  Add
                </Button>
                {showConfirm && (
                  <Box color="green.600" fontWeight="bold" mt={2}>Habit added!</Box>
                )}
                <Box w="100%" mt={4}>
                  <Heading size="sm" mb={2}>Your Habits List for Today:</Heading>
                  <Stack>
                    {habits.filter(habit => habit.date === dateKey).length === 0 ? (
                      <Box p={2} color="gray.500">No habits for this day.</Box>
                    ) : (
                      habits.filter(habit => habit.date === dateKey).map((habit, idx) => (
                        <Box key={idx} p={2} bg="red.100" borderRadius="md">{habit.text || habit.name}</Box>
                      ))
                    )}
                  </Stack>
                </Box>
              </Stack>
            );
          })()}
        </ScaleFade>
        <ScaleFade in={activeSection === "Gratitude"} initialScale={0.8} unmountOnExit transition={{ enter: { duration: 0.6 }, exit: { duration: 0.3 } }}>
          {activeSection === "Gratitude" && (() => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            return (
              <Stack spacing={4} maxW="md" w="100%" align="center">
                <Heading size="md">What are you grateful for today?</Heading>
                <Input
                  placeholder="Type your gratitude..."
                  value={gratitudeInput}
                  onChange={e => setGratitudeInput(e.target.value)}
                />
                <Button colorScheme="teal" onClick={async () => {
                  if (!gratitudeInput.trim()) return;
                  const res = await fetch(`${API_URL}/gratitude`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: dateKey, entries: [gratitudeInput.trim()] })
                  });
                  const saved = await res.json();
                  setGratitude(prev => [...prev, ...saved.map((entry, i) => ({
                    ...entry,
                    display: `${dateKey}.${prev.length + i + 1}`
                  }))]);
                  setGratitudeInput("");
                  setShowConfirm(true);
                  setTimeout(() => setShowConfirm(false), 2000);
                }}>
                  Add Gratitude
                </Button>
                {showConfirm && (
                  <Box color="green.600" fontWeight="bold" mt={2}>Gratitude added!</Box>
                )}
                {gratitude.length > 0 && (
                  <Box w="100%" mt={4}>
                    <Heading size="sm" mb={2}>Your Gratitude List for Today:</Heading>
                    <Stack>
                      {gratitude.filter(item => item.display.startsWith(dateKey)).map((item, idx) => (
                        <Box key={idx} p={2} bg="green.100" borderRadius="md">
                          {item.text}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            );
          })()}
        </ScaleFade>
        <ScaleFade in={activeSection === "Goals"} initialScale={0.8} unmountOnExit transition={{ enter: { duration: 0.6 }, exit: { duration: 0.3 } }}>
          {activeSection === "Goals" && (() => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            return (
              <Stack spacing={4} maxW="md" w="100%" align="center">
                <Heading size="md">What goal do you want to achieve today?</Heading>
                <Input
                  placeholder="Type your goal..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <Button colorScheme="teal" onClick={async () => {
                  if (!inputValue) return;
                  const res = await fetch(`${API_URL}/goals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: inputValue, deadline: dateKey })
                  });
                  const data = await res.json();
                  setGoals(Array.isArray(data) ? data : []);
                  setInputValue("");
                  setShowConfirm(true);
                  setTimeout(() => setShowConfirm(false), 2000);
                }}>
                  Add
                </Button>
                {showConfirm && (
                  <Box color="green.600" fontWeight="bold" mt={2}>Goal added!</Box>
                )}
                <Box w="100%" mt={4}>
                  <Heading size="sm" mb={2}>Your Goals List for Today:</Heading>
                  <Stack>
                    {goals.filter(goal => goal.deadline === dateKey).length === 0 ? (
                      <Box p={2} color="gray.500">No goals for this day.</Box>
                    ) : (
                      goals.filter(goal => goal.deadline === dateKey).map((goal, idx) => (
                        <Box key={idx} p={2} bg="blue.100" borderRadius="md">{goal.title}</Box>
                      ))
                    )}
                  </Stack>
                </Box>
              </Stack>
            );
          })()}
        </ScaleFade>
        <ScaleFade in={activeSection === "Worries"} initialScale={0.8} unmountOnExit transition={{ enter: { duration: 0.6 }, exit: { duration: 0.3 } }}>
          {activeSection === "Worries" && (() => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            return (
              <Stack spacing={4} maxW="md" w="100%" align="center">
                <Heading size="md">What are you worried about today?</Heading>
                <Input
                  placeholder="Type your worry..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <Button colorScheme="teal" onClick={() => {
                  if (!inputValue) return;
                  fetch(`${API_URL}/worries`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: inputValue.trim(), date: dateKey })
                  })
                    .then(res => res.json())
                    .then(data => {
                      setWorries(Array.isArray(data) ? data : []);
                      setInputValue("");
                      setShowConfirm(true);
                      setTimeout(() => setShowConfirm(false), 2000);
                    })
                    .catch(() => {
                      setInputValue("");
                      setShowConfirm(true);
                      setTimeout(() => setShowConfirm(false), 2000);
                    });
                }}>
                  Add
                </Button>
                {showConfirm && (
                  <Box color="green.600" fontWeight="bold" mt={2}>Worry added!</Box>
                )}
                <Box w="100%" mt={4}>
                  <Heading size="sm" mb={2}>Your Worries List for Today:</Heading>
                  <Stack>
                    {worries.filter(worry => worry.date === dateKey).length === 0 ? (
                      <Box p={2} color="gray.500">No worries for this day.</Box>
                    ) : (
                      worries.filter(worry => worry.date === dateKey).map((worry, idx) => (
                        <Box key={idx} p={2} bg="teal.100" borderRadius="md">{worry.name}</Box>
                      ))
                    )}
                  </Stack>
                </Box>
              </Stack>
            );
          })()}
        </ScaleFade>
        <ScaleFade in={activeSection === "Spending"} initialScale={0.8} unmountOnExit transition={{ enter: { duration: 0.6 }, exit: { duration: 0.3 } }}>
          {activeSection === "Spending" && (() => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            return (
              <Stack spacing={4} maxW="md" w="100%" align="center">
                <Heading size="md">How much did you spend today?</Heading>
                <Input
                  placeholder="Enter item (e.g. cigs)"
                  value={spendingItem}
                  onChange={e => setSpendingItem(e.target.value)}
                />
                <Input
                  placeholder="Enter amount spent..."
                  value={spendingInput}
                  onChange={e => setSpendingInput(e.target.value)}
                  type="number"
                />
                <Button colorScheme="teal" onClick={async () => {
                  if (!spendingInput || !spendingItem) return;
                  const res = await fetch(`${API_URL}/spending`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item: spendingItem, amount: Number(spendingInput), date: dateKey })
                  });
                  const result = await res.json();
                  if (result.success) {
                    setSpending(prev => {
                      const updated = { ...prev };
                      if (!updated[dateKey]) updated[dateKey] = [];
                      updated[dateKey].push(result.entry);
                      return updated;
                    });
                    setShowConfirm(true);
                    setTimeout(() => setShowConfirm(false), 2000);
                  }
                  setSpendingInput("");
                  setSpendingItem("");
                }}>
                  Add Spending
                </Button>
                {showConfirm && (
                  <Box color="purple.600" fontWeight="bold" mt={2}>Spending added!</Box>
                )}
                {spending[dateKey] && spending[dateKey].length > 0 && (
                  <Box w="100%" mt={4}>
                    <Heading size="sm" mb={2}>Your Spending for Today:</Heading>
                    <Stack>
                      {spending[dateKey].map((entry, idx) => (
                        <Box key={idx} p={2} bg="purple.100" borderRadius="md">{entry.item}: {entry.amount.toFixed(2)} SEK</Box>
                      ))}
                    </Stack>
                    <Box mt={2} fontWeight="bold">Total: {spending[dateKey].reduce((a, b) => a + b.amount, 0).toFixed(2)} SEK</Box>
                  </Box>
                )}
              </Stack>
            );
          })()}
        </ScaleFade>
        {activeSection === "Calendar" && events[selectedDate.toISOString().split('T')[0]] && events[selectedDate.toISOString().split('T')[0]].length > 0 && (
          <Box mt={8} w="100%" maxW="md">
            <Heading size="md" mb={2}>Events for Today:</Heading>
            <Stack>
              {events[selectedDate.toISOString().split('T')[0]].map((event, idx) => (
                <Box key={idx} p={2} bg="teal.100" borderRadius="md">
                  {event.text}
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        {/* Weather widget only in Calendar tab */}
        {activeSection === "Calendar" && (
          <Box mt={8} w="100%" maxW="md" textAlign="center">
            <Box mb={4} p={4} bg={colorMode === "light" ? "blue.50" : "blue.900"} borderRadius="md" boxShadow="md">
              <Heading size="sm" mb={2} color="blue.700">Weather in Stockholm, Sweden</Heading>
              {weatherLoading ? (
                <Box>Loading weather...</Box>
              ) : weather ? (
                <Box>
                  <b>Now: {weather.temperature}°C</b> &nbsp;
                  <span>Real feel: {
                    typeof weather.apparent_temperature !== 'undefined' && weather.apparent_temperature !== null
                      ? weather.apparent_temperature
                      : (weatherHourly[0] && typeof weatherHourly[0].realFeel !== 'undefined' ? weatherHourly[0].realFeel : '-')
                  }°C</span> &nbsp;
                  <span>Wind: {weather.windspeed} km/h</span>
                  <Box fontSize="sm" color="gray.500" mt={1}>Updated just now</Box>
                  <Box mt={3}>
                    <Heading size="xs" mb={1}>Next 6 hours:</Heading>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} justify="center">
                        {weatherHourly.slice(0,3).map((h, idx) => (
                          <Box key={idx} p={2} bg="blue.100" borderRadius="md" minW="100px">
                            <b>{h.time.getHours()}:00</b><br/>
                            {h.temp}°C<br/>
                            <span style={{fontSize:'0.9em'}}>Real feel: {h.realFeel}°C</span><br/>
                            <span style={{fontSize:'0.9em'}}>Wind: {h.wind} km/h</span><br/>
                            <span style={{fontSize:'0.9em'}}>Rain: {h.rain} mm</span><br/>
                            <span style={{fontSize:'0.9em'}}>Snow: {h.snow} mm</span>
                          </Box>
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={2} justify="center">
                        {weatherHourly.slice(3,6).map((h, idx) => (
                          <Box key={idx} p={2} bg="blue.100" borderRadius="md" minW="100px">
                            <b>{h.time.getHours()}:00</b><br/>
                            {h.temp}°C<br/>
                            <span style={{fontSize:'0.9em'}}>Real feel: {h.realFeel}°C</span><br/>
                            <span style={{fontSize:'0.9em'}}>Wind: {h.wind} km/h</span><br/>
                            <span style={{fontSize:'0.9em'}}>Rain: {h.rain} mm</span><br/>
                            <span style={{fontSize:'0.9em'}}>Snow: {h.snow} mm</span>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ) : (
                <Box color="red.500">Could not fetch weather.</Box>
              )}
            </Box>
            <Box p={4} bg="yellow.100" borderRadius="md" mb={4}>{currentQuote}</Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
