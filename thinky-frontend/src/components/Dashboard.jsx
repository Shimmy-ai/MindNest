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
import 'react-calendar/dist/Calendar.css';
import { Box, Flex, Heading, Spacer, Button, IconButton, useColorMode, Input, Stack, ScaleFade } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

const navItems = ["Calendar", "Habits", "Goals", "Worries", "Gratitude", "Spending"];

export default function Dashboard() {
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
  // Load habits from backend on mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/habits')
      .then(res => res.json())
      .then(data => setHabits(data))
      .catch(() => setHabits([]));
  }, []);
  const [gratitude, setGratitude] = useState([]);
  const [gratitudeInputs, setGratitudeInputs] = useState(["", "", ""]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [worries, setWorries] = useState([]);
  const [goals, setGoals] = useState([]);
  // Add state for spending
  const [spending, setSpending] = useState({});
  const [spendingInput, setSpendingInput] = useState("");
  // Add state for spending item
  const [spendingItem, setSpendingItem] = useState("");
  // Fetch spending for selected date
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    fetch(`http://127.0.0.1:5000/spending?date=${dateKey}`)
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
      setEvents(prev => ({
        ...prev,
        [dateKey]: prev[dateKey] ? [...prev[dateKey], inputValue] : [inputValue]
      }));
      setInputValue("");
    } else if (activeSection === "Habits") {
      if (!inputValue) return;
      // POST new habit to backend
      fetch('http://127.0.0.1:5000/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit: inputValue })
      })
        .then(res => res.json())
        .then(data => {
          setHabits(data);
          setInputValue("");
        })
        .catch(() => {
          setHabits(prev => [...prev, inputValue]);
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
            <Button variant={activeSection === navItems[0] ? "solid" : "ghost"} colorScheme="teal" size="md" fontWeight="bold" boxShadow={activeSection === navItems[0] ? "md" : "none"} transition="all 0.2s" onClick={() => handleNavClick(navItems[0])}>
              {navItems[0]}
            </Button>
            <Button variant={activeSection === navItems[1] ? "solid" : "ghost"} colorScheme="teal" size="md" fontWeight="bold" boxShadow={activeSection === navItems[1] ? "md" : "none"} transition="all 0.2s" onClick={() => handleNavClick(navItems[1])}>
              {navItems[1]}
            </Button>
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
              <Button key={item} variant={activeSection === item ? "solid" : "ghost"} colorScheme="teal" size="md" fontWeight="bold" boxShadow={activeSection === item ? "md" : "none"} transition="all 0.2s" onClick={() => handleNavClick(item)}>
                {item}
              </Button>
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
        {activeSection === "Habits" && (
          (() => {
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
                  setHabits(prev => [...prev, { text: inputValue, date: dateKey }]);
                  setInputValue("");
                  setShowConfirm(true);
                  setTimeout(() => setShowConfirm(false), 2000);
                }}>
                  Add
                </Button>
                {showConfirm && (
                  <Box color="green.600" fontWeight="bold" mt={2}>Habit added!</Box>
                )}
                {habits.length > 0 && (
                  <Box w="100%" mt={4}>
                    <Heading size="sm" mb={2}>Your Habits List for Today:</Heading>
                    <Stack>
                      {habits.filter(habit => habit.date === dateKey).map((habit, idx) => (
                        <Box key={idx} p={2} bg="red.100" borderRadius="md">{habit.text}</Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            );
          })()
        )}
        {activeSection === "Gratitude" && (
          (() => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            return (
              <Stack spacing={4} maxW="md" w="100%" align="center">
                <Heading size="md">What are you grateful for today?</Heading>
                {gratitudeInputs.map((val, idx) => (
                  <Input
                    key={idx}
                    placeholder={`Gratitude ${idx + 1}`}
                    value={val}
                    onChange={e => {
                      const newInputs = [...gratitudeInputs];
                      newInputs[idx] = e.target.value;
                      setGratitudeInputs(newInputs);
                    }}
                  />
                ))}
                <Button colorScheme="teal" onClick={async () => {
                  const newEntries = gratitudeInputs.filter(entry => entry.trim() !== "");
                  if (newEntries.length === 0) return;
                  const res = await fetch('http://127.0.0.1:5000/gratitude', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: dateKey, entries: newEntries })
                  });
                  const saved = await res.json();
                  setGratitude(prev => [...prev, ...saved.map((entry, i) => ({
                    ...entry,
                    display: `${dateKey}.${prev.length + i + 1}`
                  }))]);
                  setGratitudeInputs(["", "", ""]);
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
                          <b>{item.display}:</b> {item.text}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            );
          })()
        )}
        {activeSection === "Goals" && (
          (() => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            return (
              <Stack spacing={4} maxW="md" w="100%" align="center">
                <Heading size="md">What goal do you want to achieve today?</Heading>
                <Input
                  placeholder="Type your goal..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <Button colorScheme="teal" onClick={() => {
                  if (!inputValue) return;
                  setGoals(prev => [...prev, { text: inputValue, date: dateKey }]);
                  setInputValue("");
                  setShowConfirm(true);
                  setTimeout(() => setShowConfirm(false), 2000);
                }}>
                  Add
                </Button>
                {showConfirm && (
                  <Box color="green.600" fontWeight="bold" mt={2}>Goal added!</Box>
                )}
                {goals.length > 0 && (
                  <Box w="100%" mt={4}>
                    <Heading size="sm" mb={2}>Your Goals List for Today:</Heading>
                    <Stack>
                      {goals.filter(goal => goal.date === dateKey).map((goal, idx) => (
                        <Box key={idx} p={2} bg="blue.100" borderRadius="md">{goal.text}</Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            );
          })()
        )}
        {activeSection === "Worries" && (
          (() => {
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
                  setWorries(prev => [...prev, { text: inputValue, date: dateKey }]);
                  setInputValue("");
                  setShowConfirm(true);
                  setTimeout(() => setShowConfirm(false), 2000);
                }}>
                  Add
                </Button>
                {showConfirm && (
                  <Box color="green.600" fontWeight="bold" mt={2}>Worry added!</Box>
                )}
                {worries.length > 0 && (
                  <Box w="100%" mt={4}>
                    <Heading size="sm" mb={2}>Your Worries List for Today:</Heading>
                    <Stack>
                      {worries.filter(worry => worry.date === dateKey).map((worry, idx) => (
                        <Box key={idx} p={2} bg="orange.100" borderRadius="md">{worry.text}</Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            );
          })()
        )}
        {activeSection === "Spending" && (
          (() => {
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
                <Button colorScheme="purple" onClick={async () => {
                  if (!spendingInput || !spendingItem) return;
                  const res = await fetch('http://127.0.0.1:5000/spending', {
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
          })()
        )}
        {activeSection === "Calendar" && events[selectedDate.toISOString().split('T')[0]] && events[selectedDate.toISOString().split('T')[0]].length > 0 && (
          <Box mt={8} w="100%" maxW="md">
            <Heading size="md" mb={2}>Events for Today:</Heading>
            <Stack>
              {events[selectedDate.toISOString().split('T')[0]].map((event, idx) => (
                <Box key={idx} p={2} bg="teal.100" borderRadius="md">
                  {event}
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        <Box mt={8} w="100%" maxW="md" textAlign="center">
          <Heading size="md" mb={2}>Quotes</Heading>
          <Box p={4} bg="yellow.100" borderRadius="md" mb={4}>{currentQuote}</Box>
          <Button colorScheme="yellow" size="sm" mr={2} onClick={pickLocalQuote}>Show Local Quote</Button>
          <Button colorScheme="yellow" size="sm" onClick={fetchApiQuote}>Show API Quote</Button>
          {/* Removed add quote input and button as requested */}
        </Box>
      </Box>
    </Box>
  );
}
