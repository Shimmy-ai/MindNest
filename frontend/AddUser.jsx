import { useState } from "react";
import { Box, Input, Button, Stack, Heading } from "@chakra-ui/react";

export default function AddUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleAddUser = async () => {
    const res = await fetch("http://127.0.0.1:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) setMsg("User added: " + data.username);
    else setMsg(data.error || "Error");
  };

  return (
    <Box maxW="md" mx="auto" mt={8}>
      <Heading size="md" mb={4}>Add User</Heading>
      <Stack spacing={3}>
        <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button colorScheme="teal" onClick={handleAddUser}>Add User</Button>
        {msg && <Box color="red.500">{msg}</Box>}
      </Stack>
    </Box>
  );
}