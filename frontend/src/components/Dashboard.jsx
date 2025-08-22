import React, { useState, useEffect, useRef } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Box, Heading, Button, IconButton, useColorMode, Input, Stack, ScaleFade, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@chakra-ui/react";
import { AddIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";

// Constants
const WEATHER_API = "https://api.open-meteo.com/v1/forecast?latitude=59.3293&longitude=18.0686&current_weather=true";
const navItems = ["Calendar", "Habits", "Goals", "Worries", "Gratitude", "Spending"];
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

export default function Dashboard() {
  // Auth modals and state
  const loginDisclosure = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef();
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userMsg, setUserMsg] = useState("");

  // Login handler
  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) return setLoginMsg("Username and password required");
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setLoginMsg("Login successful");
        setLoginUsername("");
        setLoginPassword("");
        loginDisclosure.onClose();
      } else setLoginMsg(data.error || "Login failed");
    } catch { setLoginMsg("Server error"); }
  };

  // Registration handler
  const handleAddUser = async () => {
    if (!newUsername || !newPassword) return setUserMsg("Username and password required");
    try {
      const res = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUserMsg("User added: " + data.username);
        setNewUsername("");
        setNewPassword("");
      } else setUserMsg(data.error || "Error adding user");
    } catch { setUserMsg("Server error"); }
  };
  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch(WEATHER_API);
        const data = await res.json();
        setWeather(data.current_weather);
      } catch { setWeather(null); }
      setWeatherLoading(false);
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);
  // UI state
  const { colorMode, toggleColorMode } = useColorMode();
  const [activeSection, setActiveSection] = useState("Calendar");
  const [inputValue, setInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [quotes, setQuotes] = useState(initialQuotes);
  const [currentQuote, setCurrentQuote] = useState("");
  const [habits, setHabits] = useState([]);
  const [gratitude, setGratitude] = useState([]);
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [worries, setWorries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [spending, setSpending] = useState({});
  const [spendingInput, setSpendingInput] = useState("");
  const [spendingItem, setSpendingItem] = useState("");

  // Quotes logic
  const pickLocalQuote = () => {
    const idx = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[idx]);
  };
  useEffect(() => {
    pickLocalQuote();
    const interval = setInterval(pickLocalQuote, 600000);
    return () => clearInterval(interval);
  }, [quotes]);

  // Navigation
  const handleNavClick = (item) => {
    setActiveSection(item);
    setInputValue("");
    pickLocalQuote();
  };
  const handleDateChange = date => setSelectedDate(date);

  // Habits fetch
  useEffect(() => {
    fetch('http://127.0.0.1:5000/habits')
      .then(res => res.json())
      .then(data => setHabits(data))
      .catch(() => setHabits([]));
  }, []);

  // Spending fetch
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

  // Add handler
  const handleAdd = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    if (!inputValue) return;
    switch (activeSection) {
      case "Calendar":
        setEvents(prev => ({
          ...prev,
          [dateKey]: prev[dateKey] ? [...prev[dateKey], inputValue] : [inputValue]
        }));
        setInputValue("");
        break;
      case "Habits":
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
        break;
      case "Gratitude":
        setGratitude(prev => [...prev, inputValue]);
        setInputValue("");
        break;
      case "Goals":
        setGoals(prev => [...prev, { text: inputValue, date: dateKey }]);
        setInputValue("");
        break;
      case "Worries":
        setWorries(prev => [...prev, { text: inputValue, date: dateKey }]);
        setInputValue("");
        break;
      default:
        alert(`Added to ${activeSection}: ${inputValue}`);
        setInputValue("");
    }
  };

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
      {/* User Registration Modal Trigger Icon */}
      <Box position="fixed" top={2} right={2} zIndex={2} display={{ base: "none", md: "block" }}>
        <IconButton
          aria-label="Add user"
          icon={<AddIcon />}
          onClick={onOpen}
          colorScheme="teal"
          size={{ base: "sm", md: "md" }}
          ml={2}
          boxShadow="md"
        />
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "md" }}>
        <ModalOverlay />
        <ModalContent mx={{ base: 2, md: 0 }}>
          <ModalHeader fontSize={{ base: "md", md: "lg" }}>Add User</ModalHeader>
          <ModalBody>
            <Stack spacing={3}>
              <Input fontSize={{ base: "sm", md: "md" }} placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
              <Input fontSize={{ base: "sm", md: "md" }} placeholder="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              {userMsg && <Box color="red.500">{userMsg}</Box>}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleAddUser} fontSize={{ base: "sm", md: "md" }}>Add User</Button>
            <Button variant="ghost" onClick={onClose} fontSize={{ base: "sm", md: "md" }}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box as="nav" p={{ base: 2, md: 4 }} bg={colorMode === "light" ? "white" : "gray.900"} boxShadow="md" w="100%">
        <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 1, md: 2 }} align="center" justify="center" wrap="wrap">
          {/* Top row: Calendar, Habits, Add User, Theme toggle */}
          <Box as={motion.div} key={navItems[0]}
            animate={activeSection === navItems[0] ? { scale: 1.15, boxShadow: "0 0 0 4px #31979533" } : { scale: 1, boxShadow: "none" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <Button
              variant={activeSection === navItems[0] ? "solid" : "ghost"}
              colorScheme="teal"
              size={{ base: "sm", md: "md" }}
              fontWeight="bold"
              onClick={() => handleNavClick(navItems[0])}
            >
              {navItems[0]}
            </Button>
          </Box>
          <Box as={motion.div} key={navItems[1]}
            animate={activeSection === navItems[1] ? { scale: 1.15, boxShadow: "0 0 0 4px #31979533" } : { scale: 1, boxShadow: "none" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <Button
              variant={activeSection === navItems[1] ? "solid" : "ghost"}
              colorScheme="teal"
              size={{ base: "sm", md: "md" }}
              fontWeight="bold"
              onClick={() => handleNavClick(navItems[1])}
            >
              {navItems[1]}
            </Button>
          </Box>
          <Button colorScheme="teal" variant="outline" size={{ base: "sm", md: "md" }} ml={2} onClick={loginDisclosure.onOpen}>Login</Button>
          <Modal isOpen={loginDisclosure.isOpen} onClose={loginDisclosure.onClose} initialFocusRef={initialRef} isCentered size={{ base: "xs", md: "md" }}>
            <ModalOverlay />
            <ModalContent mx={{ base: 2, md: 0 }}>
              <ModalHeader fontSize={{ base: "md", md: "lg" }}>Login</ModalHeader>
              <ModalBody pb={6}>
                <Stack spacing={3}>
                  <Input fontSize={{ base: "sm", md: "md" }} ref={initialRef} placeholder="Username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
                  <Input fontSize={{ base: "sm", md: "md" }} placeholder="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                  {loginMsg && <Box color="red.500">{loginMsg}</Box>}
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" mr={3} onClick={handleLogin} fontSize={{ base: "sm", md: "md" }}>Login</Button>
                <Button variant="ghost" onClick={loginDisclosure.onClose} fontSize={{ base: "sm", md: "md" }}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          {/* Add User Icon in between Habits and Theme toggle, only on mobile */}
          <Box display={{ base: "block", md: "none" }}>
            <IconButton
              aria-label="Add user"
              icon={<AddIcon />}
              onClick={onOpen}
              colorScheme="teal"
              size="sm"
              boxShadow="md"
              ml={2}
            />
          </Box>
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            colorScheme="teal"
            size={{ base: "sm", md: "md" }}
            boxShadow="md"
            ml={2}
            transition="all 0.2s"
          />
        </Stack>
        <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 1, md: 2 }} align="center" justify="center" mt={{ base: 1, md: 2 }} wrap="wrap">
          {/* Second row: Goals, Worries, Gratitude, Spending */}
          {navItems.slice(2).map(item => (
            <Box as={motion.div} key={item}
              animate={activeSection === item ? { scale: 1.15, boxShadow: "0 0 0 4px #31979533" } : { scale: 1, boxShadow: "none" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Button
                variant={activeSection === item ? "solid" : "ghost"}
                colorScheme="teal"
                size={{ base: "sm", md: "md" }}
                fontWeight="bold"
                onClick={() => handleNavClick(item)}
              >
                {item}
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
      <Box p={{ base: 2, md: 8 }} display="flex" flexDirection="column" alignItems="center" w="100%">
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
                  const res = await fetch('http://127.0.0.1:5000/gratitude', {
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
                          <b>{item.display}:</b> {item.text}
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
          })()}
        </ScaleFade>
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
        {/* Weather widget above Quotes */}
        <Box mt={{ base: 4, md: 8 }} w="100%" maxW={{ base: "100%", md: "md" }} textAlign="center">
          <Box mb={4} p={{ base: 2, md: 4 }} bg={colorMode === "light" ? "blue.50" : "blue.900"} borderRadius="md" boxShadow="md">
            <Heading size={{ base: "xs", md: "sm" }} mb={2} color="blue.700">Weather in Stockholm, Sweden</Heading>
            {weatherLoading ? (
              <Box fontSize={{ base: "sm", md: "md" }}>Loading weather...</Box>
            ) : weather ? (
              <Box fontSize={{ base: "sm", md: "md" }}>
                <b>{weather.temperature}°C</b> &nbsp;
                <span>Wind: {weather.windspeed} km/h</span>
                <Box fontSize="sm" color="gray.500" mt={1}>Updated just now</Box>
              </Box>
            ) : (
              <Box color="red.500" fontSize={{ base: "sm", md: "md" }}>Could not fetch weather.</Box>
            )}
          </Box>
          <Box p={{ base: 2, md: 4 }} bg="yellow.100" borderRadius="md" mb={4} fontSize={{ base: "sm", md: "md" }}>{currentQuote}</Box>
        </Box>
      </Box>
    </Box>
  );
}

export default {
  optimizeDeps: {
    include: ['framer-motion']
  }
}
